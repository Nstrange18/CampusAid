import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, API_URL } from '../api';
import { ArrowLeft, User, Bookmark, Landmark, FileText, CheckSquare, ExternalLink, Calendar, HelpCircle, AlertCircle } from 'lucide-react';

export const AdminRequestReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await api.get(`/admin/requests/${id}`);
        setRequest(data);
      } catch (err) {
        setError(err.message || "Failed to load request details");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const getDocLabel = (type) => {
    switch (type) {
      case 'school_fee_invoice': return 'School Fee Invoice';
      case 'student_id_card': return 'Student ID Card';
      case 'admission_letter': return 'Admission Letter';
      case 'fee_balance_evidence': return 'Fee Balance Evidence';
      case 'accommodation_bill': return 'Accommodation Bill';
      case 'medical_bill': return 'Medical Bill';
      case 'recommendation_letter': return 'Recommendation Letter';
      default: return 'Supporting Document';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
        <p className="text-sm text-slate-500">Loading application audit...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-205 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h4 className="font-bold text-red-800">Error</h4>
        <p className="text-xs text-red-700">{error || "Application not found"}</p>
        <button onClick={() => navigate('/admin/requests')} className="px-4 py-2 bg-red-650 text-white rounded-lg text-xs font-bold">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/requests')}
          className="p-2 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Application Audit</h3>
          <p className="text-xs text-slate-500">Review student bio, statement, and upload logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core details column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Student details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-5 w-5 text-blue-600" />
              <h4 className="font-bold text-slate-800 text-sm">Student Demographics</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
              <p><span className="text-slate-400">Full Name:</span> {request.student?.user?.full_name}</p>
              <p><span className="text-slate-400">Matric Number:</span> {request.student?.matric_number}</p>
              <p><span className="text-slate-400">Faculty/Dept:</span> {request.student?.faculty} / {request.student?.department}</p>
              <p><span className="text-slate-400">Level:</span> {request.student?.level}</p>
              <p><span className="text-slate-400">Email Address:</span> {request.student?.user?.email}</p>
              <p><span className="text-slate-400">Phone Number:</span> {request.student?.user?.phone_number}</p>
            </div>
          </div>

          {/* Card: Campaign Statement */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bookmark className="h-5 w-5 text-blue-600" />
              <h4 className="font-bold text-slate-800 text-sm">Campaign Statement</h4>
            </div>

            <div className="space-y-3">
              <h5 className="font-extrabold text-slate-800 text-xs">{request.title}</h5>
              <p className="text-xs text-slate-550 leading-relaxed leading-loose">{request.description}</p>
              
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-xs text-slate-500">
                <p><span className="font-bold text-slate-700">Financial Need Reason:</span> {request.reason_for_request}</p>
                <p><span className="font-bold text-slate-700">Parent/Guardian Occupation:</span> {request.parent_or_guardian_occupation}</p>
                <p><span className="font-bold text-slate-700">Received Support Previously:</span> <span className="capitalize font-semibold text-slate-800">{request.previous_support_received}</span></p>
                <p className="italic pt-2">"<span className="font-medium">{request.supporting_statement}</span>"</p>
              </div>
            </div>
          </div>

          {/* Card: Bank disbursements */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Landmark className="h-5 w-5 text-blue-600" />
              <h4 className="font-bold text-slate-800 text-sm">Student Bank Account</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-650">
              <p><span className="text-slate-400">Bank Name:</span> {request.student_bank_name}</p>
              <p><span className="text-slate-400">Account Name:</span> {request.student_account_name}</p>
              <p><span className="text-slate-400">Account Number:</span> {request.student_account_number}</p>
            </div>
          </div>

        </div>

        {/* Audit sidebar: Checklist triggers and attached files */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Audit Control</h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Urgency:</span>
                <span className="font-bold uppercase tracking-wider text-red-600">{request.urgency_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Goal:</span>
                <span className="font-bold text-slate-800">₦{request.amount_needed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted:</span>
                <span className="text-slate-600">{new Date(request.date_submitted).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="h-[1px] bg-slate-100" />

            <Link
              to={`/admin/requests/${request.request_id}/checklist`}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
            >
              <CheckSquare className="h-4.5 w-4.5" />
              Open Audit Checklist
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h5 className="font-bold text-slate-700 text-xs border-b border-slate-100 pb-2">Evidence Documents ({request.documents.length})</h5>

            {request.documents.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">No files attached by the student.</p>
            ) : (
              <div className="space-y-2.5">
                {request.documents.map((doc) => (
                  <div key={doc.document_id} className="p-3 bg-slate-50 border border-slate-150 hover:border-slate-250 rounded-xl transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-slate-800 text-[10px] truncate">{getDocLabel(doc.document_type)}</p>
                      <p className="text-[8px] text-slate-400">Date: {new Date(doc.upload_date).toLocaleDateString()}</p>
                    </div>
                    <a
                      href={`${API_URL}${doc.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 rounded-lg hover:border-blue-200 transition-all shrink-0"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminRequestReview;
