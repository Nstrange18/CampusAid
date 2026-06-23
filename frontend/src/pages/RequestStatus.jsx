import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Clock, CheckCircle, XCircle, FileText, ArrowLeft, AlertCircle, HelpCircle, ShieldCheck, HeartHandshake } from 'lucide-react';

export const RequestStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await api.get(`/students/requests/${id}`);
        setRequest(data);
      } catch (err) {
        setError(err.message || "Failed to load request details");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
        <p className="text-sm text-slate-500">Loading status details...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h4 className="font-bold text-red-800">Error Loading Status</h4>
        <p className="text-xs text-red-700">{error || "Record not found"}</p>
        <button onClick={() => navigate('/student/dashboard')} className="px-4 py-2 bg-red-650 text-white rounded-lg text-xs font-bold">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const getStatusBanner = () => {
    switch (request.status) {
      case 'pending':
        return (
          <div className="p-5 bg-amber-50 border border-amber-250 rounded-2xl flex gap-3 text-amber-800 shadow-sm">
            <Clock className="h-6 w-6 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Application Under Review</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Campus administrators are currently reviewing your documents and verifying your indigent status. Check back here for updates.
              </p>
            </div>
          </div>
        );
      case 'approved':
        return (
          <div className="p-5 bg-emerald-50 border border-emerald-250 rounded-2xl flex gap-3 text-emerald-800 shadow-sm">
            <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-sm">Application Approved & Published!</h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Your request is now live as a donation campaign! Donors can view and support your campaign.
              </p>
              {request.admin_decision_reason && (
                <div className="p-3 bg-white/60 rounded-xl border border-emerald-200/50 text-[11px] text-emerald-800">
                  <span className="font-bold">Admin Review Notes:</span> {request.admin_decision_reason}
                </div>
              )}
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-red-800 shadow-sm">
            <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-sm">Application Declined</h4>
              <p className="text-xs text-red-700 leading-relaxed">
                Unfortunately, your application was not approved by the administrator.
              </p>
              {request.admin_decision_reason && (
                <div className="p-3 bg-white/60 rounded-xl border border-red-200 text-[11px] text-red-800 font-medium">
                  <span className="font-bold">Reason:</span> {request.admin_decision_reason}
                </div>
              )}
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex gap-3 text-blue-800 shadow-sm">
            <HeartHandshake className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-sm">Campaign Completed!</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                Congratulations! The target goal of ₦{request.amount_needed.toLocaleString()} has been met. The funds are processed for tuition/disbursement.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const checklistItems = [
    { label: "Student identity confirmed", status: request.checklist?.student_identity_confirmed },
    { label: "Matric number confirmed", status: request.checklist?.matric_number_confirmed },
    { label: "Faculty/Department confirmed", status: request.checklist?.department_faculty_confirmed },
    { label: "Uploaded documents reviewed", status: request.checklist?.documents_reviewed },
    { label: "Financial need evidence confirmed", status: request.checklist?.financial_need_confirmed },
    { label: "Requested amount is reasonable", status: request.checklist?.requested_amount_reasonable },
    { label: "Duplicate support checked", status: request.checklist?.duplicate_support_checked }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="p-2 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Application Status</h3>
          <p className="text-xs text-slate-500">Track the verification checks and live fundraising metrics</p>
        </div>
      </div>

      {getStatusBanner()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Campaign Metrics Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Fundraising Status</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Fundraising Target:</span>
              <span className="font-bold text-slate-800">₦{request.amount_needed.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Amount Raised:</span>
              <span className="font-bold text-blue-600">₦{request.amount_raised.toLocaleString()}</span>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (request.amount_raised / request.amount_needed) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>{Math.min(100, Math.round((request.amount_raised / request.amount_needed) * 100))}% Funded</span>
                <span>₦{(request.amount_needed - request.amount_raised).toLocaleString()} left</span>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100" />

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Disbursement Account Details</h5>
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-xs text-slate-600">
              <p><span className="font-semibold">Bank:</span> {request.student_bank_name}</p>
              <p><span className="font-semibold">Account Name:</span> {request.student_account_name}</p>
              <p><span className="font-semibold">Account Number:</span> {request.student_account_number}</p>
            </div>
          </div>
        </div>

        {/* Verification Checklist Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h4 className="font-bold text-slate-800 text-sm">Administrator Verification Checklist</h4>
          </div>

          {!request.checklist ? (
            <div className="text-center py-10 text-slate-400">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium">Checklist review has not started yet.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">The administrator will inspect your uploaded documents shortly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50/40 transition-colors">
                  <span className="text-xs text-slate-655 font-semibold">{item.label}</span>
                  {item.status ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-450 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                      <Clock className="h-3 w-3" />
                      Awaiting Check
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default RequestStatus;
