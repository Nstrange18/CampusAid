import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ShieldCheck, ArrowLeft, Send, CheckCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react';

export const AdminChecklist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [checklistExists, setChecklistExists] = useState(false);
  const [loading, setLoading] = useState(true);

  // Checklist Checkbox States
  const [studentIdentity, setStudentIdentity] = useState(false);
  const [matricNumber, setMatricNumber] = useState(false);
  const [deptFaculty, setDeptFaculty] = useState(false);
  const [docsReviewed, setDocsReviewed] = useState(false);
  const [needConfirmed, setNeedConfirmed] = useState(false);
  const [amountReasonable, setAmountReasonable] = useState(false);
  const [duplicateChecked, setDuplicateChecked] = useState(false);

  // Decision States
  const [decision, setDecision] = useState("approve"); // approve, reject
  const [reason, setReason] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch request
        const reqData = await api.get(`/admin/requests/${id}`);
        setRequest(reqData);

        // Fetch checklist if exists
        try {
          const checklist = await api.get(`/admin/requests/${id}/verification-checklist`);
          setStudentIdentity(checklist.student_identity_confirmed);
          setMatricNumber(checklist.matric_number_confirmed);
          setDeptFaculty(checklist.department_faculty_confirmed);
          setDocsReviewed(checklist.documents_reviewed);
          setNeedConfirmed(checklist.financial_need_confirmed);
          setAmountReasonable(checklist.requested_amount_reasonable);
          setDuplicateChecked(checklist.duplicate_support_checked);
          setChecklistExists(true);
        } catch (err) {
          // 404 error means checklist is not created yet
          setChecklistExists(false);
        }
      } catch (err) {
        setError(err.message || "Failed to load audit resources");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!reason) {
      setError("A decision comment/reason is required.");
      return;
    }

    // If approving, make sure ALL checklist items are checked
    const allChecked = studentIdentity && matricNumber && deptFaculty && docsReviewed && needConfirmed && amountReasonable && duplicateChecked;
    if (decision === "approve" && !allChecked) {
      setError("Cannot approve application: All indigent verification checklist items must be reviewed and confirmed first.");
      return;
    }

    setSaving(true);
    try {
      const checklistPayload = {
        student_identity_confirmed: studentIdentity,
        matric_number_confirmed: matricNumber,
        department_faculty_confirmed: deptFaculty,
        documents_reviewed: docsReviewed,
        financial_need_confirmed: needConfirmed,
        requested_amount_reasonable: amountReasonable,
        duplicate_support_checked: duplicateChecked,
        decision_recorded: true
      };

      // Step 1: Create or Update checklist
      if (checklistExists) {
        await api.put(`/admin/requests/${id}/verification-checklist`, checklistPayload);
      } else {
        await api.post(`/admin/requests/${id}/verification-checklist`, checklistPayload);
      }

      // Step 2: Finalize request status decision (approve or reject)
      if (decision === "approve") {
        await api.put(`/admin/requests/${id}/approve`, { reason: reason });
        setSuccess("Application approved and published successfully as an active campaign!");
      } else {
        await api.put(`/admin/requests/${id}/reject`, { reason: reason });
        setSuccess("Application declined. Decision saved.");
      }

      setTimeout(() => {
        navigate('/admin/requests');
      }, 2500);
    } catch (err) {
      setError(err.message || "Failed to submit checklist decisions");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading checklist details...</p>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="bg-red-50 dark:bg-red-955/20 p-6 rounded-2xl border border-red-200 dark:border-red-900/30 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h4 className="font-bold text-red-800 dark:text-red-400">Error</h4>
        <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
        <button onClick={() => navigate('/admin/requests')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
          Back to List
        </button>
      </div>
    );
  }

  const checklistItems = [
    { id: "identity", label: "Student Identity Confirmed", description: "Verify student full name and profile matches registration record", state: studentIdentity, setter: setStudentIdentity },
    { id: "matric", label: "Matric Number Confirmed", description: "Cross check matric number syntax with university database formats", state: matricNumber, setter: setMatricNumber },
    { id: "dept", label: "Faculty / Department Confirmed", description: "Verify Course/Level parameters correspond to registration standing", state: deptFaculty, setter: setDeptFaculty },
    { id: "docs", label: "Uploaded Documents Reviewed", description: "Read through invoice details, accommodation statements or adviser letters", state: docsReviewed, setter: setDocsReviewed },
    { id: "need", label: "Financial Need Confirmed", description: "Ensure invoice costs are valid and the family situation warrants support", state: needConfirmed, setter: setNeedConfirmed },
    { id: "amount", label: "Requested Amount is Reasonable", description: "Confirm the requested target is minimal, accurate, and direct-to-purpose", state: amountReasonable, setter: setAmountReasonable },
    { id: "duplicate", label: "Duplicate Support Checked", description: "Check logs to prevent double support disbursements this semester", state: duplicateChecked, setter: setDuplicateChecked }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/admin/requests/${id}/review`)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Audit Verification Checklist</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Student: <span className="font-semibold text-slate-700 dark:text-slate-300">{request?.student?.user?.full_name}</span></p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-300 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 animate-bounce" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Checklist options */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4 transition-colors duration-300">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-450" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Indigent Checklist Items</h4>
          </div>

          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div 
                key={item.id} 
                className={`p-3.5 border rounded-2xl flex items-start gap-3 transition-colors ${
                  item.state 
                    ? 'bg-blue-50/10 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/40' 
                    : 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={(e) => item.setter(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 dark:text-blue-500 border-slate-300 dark:border-slate-700 focus:ring-blue-500/20 mt-0.5 cursor-pointer shrink-0"
                />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision & Reason Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors duration-300">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">Audit Decision</h4>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Verify Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision("approve")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      decision === 'approve' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-900/40' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    Approve Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision("reject")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      decision === 'reject' 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-900/40' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    Decline Request
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Decision Comment / Notes</label>
                <textarea
                  placeholder="Provide detailed reasons for approval or rejection. This comment will be visible to the student."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                {saving ? "Submitting Decision..." : "Commit Decision"}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
export default AdminChecklist;
