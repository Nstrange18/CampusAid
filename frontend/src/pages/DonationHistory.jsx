import React, { useState, useEffect } from 'react';
import { api, API_URL } from '../api';
import { History, Heart, Clock, CheckCircle, XCircle, ExternalLink, Calendar, Search } from 'lucide-react';

export const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await api.get("/donors/donations");
        setDonations(data);
      } catch (err) {
        console.error("Error loading donations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-full uppercase">Verified</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-full uppercase">Rejected</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded-full uppercase">Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 rounded-full uppercase">{status}</span>;
    }
  };

  const filteredDonations = donations.filter(d => {
    const matchesStatus = statusFilter === "all" || d.verification_status === statusFilter;
    const matchesSearch = d.transaction_reference.toLowerCase().includes(search.toLowerCase()) || 
                          (d.request && d.request.title.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Donation Records</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Track and review the status of your external support records</p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3 transition-colors duration-300">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search reference or campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all"
          />
        </div>

        {/* Status */}
        <div className="relative w-full md:w-48">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Clock className="h-4 w-4" />
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">All Verification Statuses</option>
            <option value="pending">Pending Reviews</option>
            <option value="verified">Verified Transfers</option>
            <option value="rejected">Declined Records</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading donation history...</p>
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center rounded-2xl max-w-md mx-auto space-y-2 transition-colors duration-300">
          <History className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300">No records found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-450">No donation records match your filter parameters.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 rounded-l-2xl">Campaign Beneficiary</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right rounded-r-2xl">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {filteredDonations.map((d) => (
                    <tr key={d.donation_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{d.request?.title || `Campaign #${d.request_id}`}</span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-600 dark:text-slate-400">{d.transaction_reference}</td>
                      <td className="p-4 font-extrabold text-slate-800 dark:text-slate-100">₦{d.amount.toLocaleString()}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{new Date(d.donation_date).toLocaleDateString()}</td>
                      <td className="p-4">{getStatusBadge(d.verification_status)}</td>
                      <td className="p-4 text-right">
                        {d.proof_file ? (
                          <a
                            href={`${API_URL}${d.proof_file}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-800/60 transition-all font-bold"
                          >
                            View File
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No File</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredDonations.map((d) => (
              <div key={d.donation_id} className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 transition-colors duration-300">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-snug line-clamp-2">
                    {d.request?.title || `Campaign #${d.request_id}`}
                  </h4>
                  {getStatusBadge(d.verification_status)}
                </div>

                <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

                <div className="grid grid-cols-2 gap-y-2 text-[11px] font-medium text-slate-600 dark:text-slate-350">
                  <p><span className="text-slate-400 dark:text-slate-500">Amount:</span> ₦{d.amount.toLocaleString()}</p>
                  <p className="font-mono"><span className="text-slate-400 dark:text-slate-500">Ref:</span> {d.transaction_reference}</p>
                  <p className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400 dark:text-slate-500" /> {new Date(d.donation_date).toLocaleDateString()}</p>
                </div>

                {d.proof_file && (
                  <a
                    href={`${API_URL}${d.proof_file}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all"
                  >
                    View Attached Receipt
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
export default DonationHistory;
