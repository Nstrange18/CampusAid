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

  const openPrivateDocument = async (documentId) => {
    try {
      const access = await api.get(`/admin/documents/${documentId}/access`);
      const url = access.url.startsWith('http') ? access.url : `${API_URL}${access.url}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err.message || "Unable to open this private document");
    }
  };

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
      case 'university_support_office': return 'University Support Office Confirmation';
      case 'medical_professional_report': return 'Medical or Rehabilitation Professional Report';
      case 'government_disability_certificate': return 'Government Disability Certificate';
      case 'accessibility_assessment': return 'Accessibility Assessment';
      case 'assistive_device_quote': return 'Assistive Device Quote';
      case 'support_cost_quote': return 'Support Cost Quote';
      case 'approved_alternative': return 'Approved Alternative Evidence';
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
      <div className="bg-red-50 dark:bg-red-955/20 p-6 rounded-2xl border border-red-200 dark:border-red-900/30 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h4 className="font-bold text-red-800 dark:text-red-400">Error</h4>
        <p className="text-xs text-red-700 dark:text-red-300">{error || "Application not found"}</p>
        <button onClick={() => navigate('/admin/requests')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/requests')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Application Audit</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Review student bio, statement, and upload logs</p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Core details column */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          
          {/* Card: Student details */}
          <div className="min-w-0 overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-450" />
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Student Demographics</h4>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 md:grid-cols-2 [&>p]:min-w-0 [&>p]:break-words">
              <p><span className="text-slate-400 dark:text-slate-500">Full Name:</span> {request.student?.user?.full_name}</p>
              <p><span className="text-slate-400 dark:text-slate-500">Matric Number:</span> {request.student?.matric_number}</p>
              <p><span className="text-slate-400 dark:text-slate-500">Faculty/Dept:</span> {request.student?.faculty} / {request.student?.department}</p>
              <p><span className="text-slate-400 dark:text-slate-500">Level:</span> {request.student?.level}</p>
              <p><span className="text-slate-400 dark:text-slate-500">Email Address:</span> {request.student?.user?.email}</p>
              <p><span className="text-slate-400 dark:text-slate-500">Phone Number:</span> {request.student?.user?.phone_number}</p>
            </div>
          </div>

          {/* Card: Campaign Statement */}
          <div className="min-w-0 overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Bookmark className="h-5 w-5 text-blue-600 dark:text-blue-455" />
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Campaign Statement</h4>
            </div>

            <div className="min-w-0 space-y-3 [overflow-wrap:anywhere]">
              <h5 className="min-w-0 font-extrabold text-slate-800 dark:text-slate-100 text-xs">{request.title}</h5>
              <p className="min-w-0 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{request.description}</p>
              
              <div className="min-w-0 overflow-hidden p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-500 dark:text-slate-400 [overflow-wrap:anywhere]">
                <p><span className="font-bold text-slate-700 dark:text-slate-350">Support Needed:</span> {request.support_need_description || request.reason_for_request}</p>
                <p><span className="font-bold text-slate-700 dark:text-slate-350">Functional Impact:</span> {request.functional_impact || 'Not provided in this legacy application'}</p>
                <p><span className="font-bold text-slate-700 dark:text-slate-350">Requested Support Type:</span> {request.requested_support_type || request.purpose}</p>
                <p><span className="font-bold text-slate-700 dark:text-slate-350">Received Support Previously:</span> <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">{request.previous_support_received}</span></p>
                <p className="italic pt-2">"<span className="font-medium">{request.supporting_statement}</span>"</p>
              </div>
            </div>
          </div>

          {/* Card: Bank disbursements */}
          <div className="min-w-0 overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Landmark className="h-5 w-5 text-blue-600 dark:text-blue-450" />
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Student Bank Account (Private)</h4>
            </div>

            {request.student_bank_name ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <p><span className="text-slate-400 dark:text-slate-500">Bank Name:</span> {request.student_bank_name}</p>
                <p><span className="text-slate-400 dark:text-slate-500">Account Name:</span> {request.student_account_name}</p>
                <p><span className="text-slate-400 dark:text-slate-500">Account Number:</span> {request.student_account_number}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-455 italic">No direct bank details provided. Disbursement must be made directly to the school or service vendor.</p>
            )}
          </div>

        </div>

        {/* Audit sidebar: Checklist triggers and attached files */}
        <div className="min-w-0 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors duration-300">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">Audit Control</h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Urgency:</span>
                <span className="font-bold uppercase tracking-wider text-red-600 dark:text-red-400">{request.urgency_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Target Goal:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">₦{request.amount_needed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Submitted:</span>
                <span className="text-slate-600 dark:text-slate-300">{new Date(request.date_submitted).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

            <Link
              to={`/admin/requests/${request.request_id}/checklist`}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckSquare className="h-4.5 w-4.5" />
              Open Audit Checklist
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
            <h5 className="font-bold text-slate-700 dark:text-slate-300 text-xs border-b border-slate-100 dark:border-slate-800 pb-2">Evidence Documents ({request.documents.length})</h5>

            {request.documents.length === 0 ? (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No files attached by the student.</p>
            ) : (
              <div className="space-y-2.5">
                {request.documents.map((doc) => (
                  <div key={doc.document_id} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 rounded-xl transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-[10px] truncate">{getDocLabel(doc.document_type)}</p>
                      <p className="text-[8px] text-slate-400 dark:text-slate-500">Date: {new Date(doc.upload_date).toLocaleDateString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openPrivateDocument(doc.document_id)}
                      className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-955/40 text-blue-600 dark:text-blue-400 rounded-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all shrink-0"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
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
