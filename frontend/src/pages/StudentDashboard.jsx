import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { FileText, AlertTriangle, PlusCircle, CheckCircle, Clock, XCircle, HeartHandshake, UploadCloud } from 'lucide-react';

export const StudentDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.get("/students/requests");
        setRequests(data);
      } catch (err) {
        console.error("Failed to load requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-amber-500" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'completed': return <HeartHandshake className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded-lg uppercase">Pending Review</span>;
      case 'approved':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-lg uppercase">Approved Campaign</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg uppercase">Rejected</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded-lg uppercase">Completed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg uppercase">{status}</span>;
    }
  };

  const activeRequest = requests.find(r => r.status === 'pending' || r.status === 'approved');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Alert if pending and needs documents */}
      {activeRequest && activeRequest.status === 'pending' && activeRequest.documents.length === 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Documents Missing:</span> You have a pending request '{activeRequest.title}' but haven't uploaded any verification documents yet.
            </div>
          </div>
          <Link
            to={`/student/requests/${activeRequest.request_id}/upload`}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 self-start sm:self-center"
          >
            <UploadCloud className="h-4 w-4" />
            Upload Evidence
          </Link>
        </div>
      )}

      {/* Main Stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors duration-300">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Requests</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{requests.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors duration-300">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Active Fundings</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
            {requests.filter(r => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors duration-300">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Amount Raised</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
            ₦{requests.reduce((sum, r) => sum + r.amount_raised, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions & Applications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Your Fundraising Applications</h3>
          {!activeRequest && (
            <Link
              to="/student/requests/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10"
            >
              <PlusCircle className="h-4 w-4" />
              Apply for Aid
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-md mx-auto space-y-4 transition-colors duration-300">
            <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No requests submitted yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-450">Submit a request with school fee invoice or accommodation bills to begin.</p>
            </div>
            <Link
              to="/student/requests/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              Apply Now
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 transition-colors duration-300">
            {requests.map((r) => {
              const percent = Math.min(100, Math.round((r.amount_raised / r.amount_needed) * 100));
              return (
                <div key={r.request_id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 transition-colors">
                      {getStatusIcon(r.status)}
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate max-w-md">{r.title}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-505">Submitted: {new Date(r.date_submitted).toLocaleDateString()}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                        {getStatusBadge(r.status)}
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Goal: ₦{r.amount_needed.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right space-y-3 shrink-0 flex flex-row sm:flex-col items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="space-y-1 w-2/3 sm:w-36 text-left sm:text-right">
                      <div className="flex justify-between sm:justify-end text-[10px] font-bold text-slate-500 dark:text-slate-400 gap-1.5">
                        <span>{percent}% funded</span>
                        <span>₦{r.amount_raised.toLocaleString()} raised</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-850 rounded-full h-1.5 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {r.status === 'pending' && (
                        <Link
                          to={`/student/requests/${r.request_id}/upload`}
                          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-200/80 dark:border-slate-700"
                        >
                          Documents ({r.documents.length})
                        </Link>
                      )}
                      <Link
                        to={`/student/requests/${r.request_id}/status`}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        View Status
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default StudentDashboard;
