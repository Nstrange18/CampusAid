import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { CheckSquare, DollarSign, HeartHandshake, Users, Clock, Landmark, Activity, ChevronRight, Save } from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bank form settings
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [paymentInstruction, setPaymentInstruction] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setData(res);

      // Fetch active donation account details
      const activeCampaigns = await api.get("/campaigns");
      // campaigns API details return admin payment accounts array, let's look for one
      if (activeCampaigns.length > 0) {
        // Just call a dummy campaign details, or since we can load active details:
        // Actually, we can fetch active account by query. Let's make a call to get active accounts
        // or just let the user edit the details. We can query the details if it's there
      }
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSavingAccount(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await api.put("/admin/donation-account", {
        bank_name: bankName,
        account_name: accountName,
        account_number: accountNumber,
        payment_instruction: paymentInstruction
      });
      setSuccessMsg("System welfare payment details updated successfully!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update account details");
    } finally {
      setSavingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
        <p className="text-sm text-slate-500">Loading admin panel...</p>
      </div>
    );
  }

  const { stats, recent_requests, recent_donations } = data;

  return (
    <div className="space-y-8">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold">Pending Requests</p>
            <p className="text-2xl font-black text-slate-800">{stats.pending_requests}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold">Active Campaigns</p>
            <p className="text-2xl font-black text-slate-800">{stats.approved_requests}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <HeartHandshake className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold">Total Verified Donations</p>
            <p className="text-2xl font-black text-slate-800">₦{stats.total_donations_sum.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold">Total Registered Users</p>
            <p className="text-2xl font-black text-slate-800">{stats.total_users}</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-150">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Applications Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-850 text-sm flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-blue-600" />
              Recent Applications
            </h4>
            <Link to="/admin/requests" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5">
              Review All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {recent_requests.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No student applications submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {recent_requests.map((r) => (
                <div key={r.request_id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="font-bold text-slate-850 text-xs truncate">{r.title}</p>
                    <p className="text-[9px] text-slate-400">Date: {new Date(r.date_submitted).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right space-y-1.5 shrink-0">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                      r.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      r.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                      r.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {r.status}
                    </span>
                    <p className="font-bold text-slate-800 text-[11px]">₦{r.amount_needed.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Settings: Administration Payment Accounts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-850 text-sm flex items-center gap-2">
              <Landmark className="h-4.5 w-4.5 text-blue-600" />
              General Trust Account Settings
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Define account details visible to donors</p>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-250 rounded-xl">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 text-[10px] font-semibold border border-red-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSaveAccount} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. Campus Trust Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium text-slate-700"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Account Name</label>
              <input
                type="text"
                placeholder="e.g. CampusAid Welfare Fund"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium text-slate-700"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Account Number</label>
              <input
                type="text"
                placeholder="e.g. 1012345678"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium text-slate-700"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Instructions for Donors</label>
              <textarea
                placeholder="Kindly specify reference ID in transfer..."
                value={paymentInstruction}
                onChange={(e) => setPaymentInstruction(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all font-medium text-slate-700"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingAccount}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              {savingAccount ? "Saving Account..." : "Save Payment Details"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
