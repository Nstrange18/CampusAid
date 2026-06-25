import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { HeartHandshake, DollarSign, Calendar, Search, HelpCircle, Edit } from 'lucide-react';

export const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCampaigns = async () => {
    try {
      const data = await api.get("/admin/campaigns");
      setCampaigns(data);
    } catch (err) {
      console.error("Error loading campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/campaigns/${id}`, { status: newStatus });
      // Refresh campaign list
      fetchCampaigns();
    } catch (err) {
      alert("Failed to update campaign status: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded uppercase">Active</span>;
      case 'completed':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded uppercase">Completed</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-red-50 dark:bg-red-955/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded uppercase">Rejected</span>;
      case 'pending':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded uppercase">Pending</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 rounded uppercase">{status}</span>;
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    (c.student && c.student.user.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Campaign Management</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Oversee published student welfare campaigns and adjust status parameters</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search campaign or student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-semibold"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading campaigns list...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center rounded-2xl max-w-md mx-auto space-y-3 transition-colors duration-300">
          <HeartHandshake className="h-12 w-12 text-slate-400 dark:text-slate-655 mx-auto" />
          <h4 className="font-bold text-slate-700 dark:text-slate-350">No campaigns found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-450">There are no campaigns matching your search filter terms.</p>
        </div>
      ) : (
        <>
          {/* Desktop campaigns table */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 rounded-l-2xl">Campaign Beneficiary</th>
                    <th className="p-4">Target Needed</th>
                    <th className="p-4">Amount Raised</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right rounded-r-2xl">Override Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {filteredCampaigns.map((c) => {
                    const percent = Math.min(100, Math.round((c.amount_raised / c.amount_needed) * 100));
                    return (
                      <tr key={c.request_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{c.title}</span>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500">Student: {c.student?.user?.full_name} • {c.student?.matric_number}</p>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-100">₦{c.amount_needed.toLocaleString()}</td>
                        <td className="p-4 font-extrabold text-blue-605 dark:text-blue-400">₦{c.amount_raised.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 w-32">
                            <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">{percent}%</span>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(c.status)}</td>
                        <td className="p-4 text-right">
                          <select
                            value={c.status}
                            onChange={(e) => handleStatusChange(c.request_id, e.target.value)}
                            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 dark:text-slate-100 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                          >
                            <option value="pending" className="dark:bg-slate-900">Pending</option>
                            <option value="approved" className="dark:bg-slate-900">Active/Approved</option>
                            <option value="rejected" className="dark:bg-slate-900">Rejected</option>
                            <option value="completed" className="dark:bg-slate-900">Completed</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile campaigns card view */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredCampaigns.map((c) => {
              const percent = Math.min(100, Math.round((c.amount_raised / c.amount_needed) * 100));
              return (
                <div key={c.request_id} className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 transition-colors duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-snug line-clamp-2">{c.title}</h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">Student: {c.student?.user?.full_name}</p>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>

                  <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

                  <div className="space-y-2 text-[11px] font-semibold text-slate-655 dark:text-slate-350">
                    <p><span className="text-slate-400 dark:text-slate-500">Target Needed:</span> ₦{c.amount_needed.toLocaleString()}</p>
                    <p><span className="text-slate-400 dark:text-slate-500">Amount Raised:</span> ₦{c.amount_raised.toLocaleString()}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px] shrink-0">{percent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="text-[10px] text-slate-455 dark:text-slate-500 flex items-center gap-1"><Edit className="h-3.5 w-3.5" /> Adjust Status:</span>
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.request_id, e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 transition-all cursor-pointer"
                    >
                      <option value="pending" className="dark:bg-slate-900">Pending</option>
                      <option value="approved" className="dark:bg-slate-900">Active</option>
                      <option value="rejected" className="dark:bg-slate-900">Rejected</option>
                      <option value="completed" className="dark:bg-slate-900">Completed</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
export default AdminCampaigns;
