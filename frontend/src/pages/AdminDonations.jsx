import React, { useState, useEffect } from 'react';
import { api, API_URL } from '../api';
import { DollarSign, Clock, Check, X, ExternalLink, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Rejection modal state
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [savingRejection, setSavingRejection] = useState(false);

  const fetchPendingDonations = async () => {
    try {
      const data = await api.get("/admin/donations/pending");
      setDonations(data);
    } catch (err) {
      console.error("Error loading pending donations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDonations();
  }, []);

  const handleVerify = async (id) => {
    if (!window.confirm("Are you sure you want to verify this payment receipt? The donation amount will be instantly credited to the campaign progress.")) return;
    
    try {
      await api.put(`/admin/donations/${id}/verify`);
      toast.success("Donation verified successfully!");
      fetchPendingDonations();
    } catch (err) {
      toast.error("Failed to verify donation: " + err.message);
    }
  };

  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason) return;

    setSavingRejection(true);
    try {
      await api.put(`/admin/donations/${rejectingId}/reject`, { reason: rejectionReason });
      toast.success("Donation declined. Feedback has been sent to the donor.");
      setRejectingId(null);
      setRejectionReason("");
      fetchPendingDonations();
    } catch (err) {
      toast.error("Failed to decline record: " + err.message);
    } finally {
      setSavingRejection(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Verify Donation Receipts</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Cross reference external bank transfers with donor-uploaded proofs</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading pending receipts...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center rounded-2xl max-w-md mx-auto space-y-3 transition-colors duration-300">
          <DollarSign className="h-12 w-12 text-slate-400 dark:text-slate-655 mx-auto" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300">All receipts verified!</h4>
          <p className="text-xs text-slate-500 dark:text-slate-450">There are no pending donation records waiting for audit.</p>
        </div>
      ) : (
        <>
          {/* Desktop view */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 rounded-l-2xl">Donor</th>
                    <th className="p-4">Beneficiary Campaign</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Receipt</th>
                    <th className="p-4 text-right rounded-r-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {donations.map((d) => (
                    <tr key={d.donation_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{d.donor?.user?.full_name}</span>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500">Type: {d.donor?.donor_type}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{d.request?.title}</span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-600 dark:text-slate-300">{d.transaction_reference}</td>
                      <td className="p-4 font-extrabold text-emerald-700 dark:text-emerald-400">₦{d.amount.toLocaleString()}</td>
                      <td className="p-4">
                        <a
                          href={`${API_URL}${d.proof_file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-all font-bold"
                        >
                          View Receipt
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleVerify(d.donation_id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:text-white dark:hover:text-white rounded-lg font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                          Verify
                        </button>
                        <button
                          onClick={() => setRejectingId(d.donation_id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-600 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 hover:text-white dark:hover:text-white rounded-lg font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile view */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {donations.map((d) => (
              <div key={d.donation_id} className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 transition-colors duration-300">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-snug line-clamp-1">{d.request?.title}</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">Donor: {d.donor?.user?.full_name}</p>
                </div>

                <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

                <div className="grid grid-cols-2 gap-y-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <p><span className="text-slate-400 dark:text-slate-500">Amount:</span> ₦{d.amount.toLocaleString()}</p>
                  <p className="font-mono"><span className="text-slate-400 dark:text-slate-500">Ref:</span> {d.transaction_reference}</p>
                </div>

                {d.proof_file && (
                  <a
                    href={`${API_URL}${d.proof_file}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs font-bold transition-all"
                  >
                    View Receipt Image
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleVerify(d.donation_id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    Verify Pay
                  </button>
                  <button
                    onClick={() => setRejectingId(d.donation_id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-600 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 hover:text-white dark:hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Decline Feedback modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full space-y-4 transition-colors duration-300">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <MessageSquare className="h-5 w-5 text-red-500" />
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Decline Donation Proof</h4>
            </div>

            <form onSubmit={handleDeclineSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Decline Reason</label>
                <textarea
                  placeholder="e.g. Reference is incorrect or transfer details are unverified. This feedback will be sent to the donor's notifications."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-semibold font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all border border-slate-200/80 dark:border-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRejection}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-red-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  {savingRejection ? "Saving..." : "Confirm Decline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDonations;
