import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { CheckSquare, ArrowRight, Eye, Calendar, AlertCircle } from 'lucide-react';

export const AdminRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await api.get("/admin/requests/pending");
        setRequests(data);
      } catch (err) {
        console.error("Failed to load pending requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800">Pending Applications</h3>
        <p className="text-xs text-slate-500">Review indigent student claims and verify supporting evidence</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
          <p className="text-sm text-slate-500">Loading student requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm p-12 text-center rounded-2xl max-w-md mx-auto space-y-3">
          <CheckSquare className="h-12 w-12 text-slate-350 mx-auto" />
          <h4 className="font-bold text-slate-700">All caught up!</h4>
          <p className="text-xs text-slate-500">There are no student fundraising requests waiting for review.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                  <th className="p-4 rounded-l-2xl">Student Name</th>
                  <th className="p-4">Faculty / Department</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Target Amount</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Documents</th>
                  <th className="p-4 text-right rounded-r-2xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {requests.map((r) => (
                  <tr key={r.request_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800">{r.student?.user?.full_name || "Unknown"}</span>
                        <p className="text-[10px] text-slate-400">Matric: {r.student?.matric_number}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span>{r.student?.department}</span>
                        <p className="text-[9px] text-slate-400">{r.student?.faculty} • {r.student?.level}</p>
                      </div>
                    </td>
                    <td className="p-4 capitalize">{r.purpose}</td>
                    <td className="p-4 font-bold text-slate-800">₦{r.amount_needed.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        r.urgency_level === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                        r.urgency_level === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-50 text-slate-500 border border-slate-100'
                      }`}>
                        {r.urgency_level}
                      </span>
                    </td>
                    <td className="p-4 text-slate-550">
                      <span className="font-bold">{r.documents.length}</span> file(s)
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/admin/requests/${r.request_id}/review`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Audit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminRequestsList;
