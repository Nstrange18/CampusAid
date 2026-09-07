import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, API_URL } from '../api';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, DollarSign, HeartHandshake, Users, Clock, Landmark, Activity, ChevronRight, Save, Plus, Upload, ExternalLink, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { confirmToast } from '../utils/toastActions';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, disbursements

  // Trust Account Form States
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [paymentInstruction, setPaymentInstruction] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Disbursements Tab States
  const [disbursements, setDisbursements] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loadingDisbursements, setLoadingDisbursements] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  // Disbursement Form States
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [recipientType, setRecipientType] = useState("school"); // school, hostel, hospital, vendor, student_exception
  const [recipientName, setRecipientName] = useState("");
  const [amountDisbursed, setAmountDisbursed] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [disbursementNotes, setDisbursementNotes] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submittingDisbursement, setSubmittingDisbursement] = useState(false);
  const [disburseError, setDisburseError] = useState("");
  const [disburseSuccess, setDisburseSuccess] = useState("");
  const isSuperAdmin = user?.is_super_admin === true;

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setData(res);

      // Fetch active donation account details
      const activeCampaigns = await api.get("/campaigns");
      if (activeCampaigns.length > 0) {
        try {
          const approved = activeCampaigns.find(c => c.status === "active" || c.status === "funded");
          if (approved) {
            const details = await api.get(`/campaigns/${approved.request_id}`);
            if (details.admin_payment_accounts && details.admin_payment_accounts.length > 0) {
              setBankName(details.admin_payment_accounts[0].bank_name || "");
              setAccountName(details.admin_payment_accounts[0].account_name || "");
              setAccountNumber(details.admin_payment_accounts[0].account_number || "");
              setPaymentInstruction(details.admin_payment_accounts[0].payment_instruction || "");
            }
          }
        } catch (err) {
          console.error("Error fetching donation account details:", err);
        }
      }
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisbursementsData = async () => {
    setLoadingDisbursements(true);
    try {
      const disburseList = await api.get("/admin/disbursements");
      setDisbursements(disburseList);

      const campaignList = await api.get("/admin/campaigns");
      setAllCampaigns(campaignList);
    } catch (err) {
      console.error("Error fetching disbursements:", err);
    } finally {
      setLoadingDisbursements(false);
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

    if (!isSuperAdmin) {
      setErrorMsg("Only super admins can update the trust account settings.");
      setSavingAccount(false);
      return;
    }

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

  const handleLogDisbursementSubmit = async (e) => {
    e.preventDefault();
    setDisburseError("");
    setDisburseSuccess("");

    if (!selectedCampaignId || !recipientName || !amountDisbursed || !paymentReference) {
      setDisburseError("Please fill in all required fields.");
      return;
    }

    const amt = parseFloat(amountDisbursed);
    if (isNaN(amt) || amt <= 0) {
      setDisburseError("Disbursement amount must be greater than zero.");
      return;
    }

    // Double check that we don't disburse more than target (warning/guard)
    const targetCampaign = allCampaigns.find(c => c.request_id === parseInt(selectedCampaignId));
    if (targetCampaign && amt > targetCampaign.amount_raised) {
      const confirmed = await confirmToast({
        title: "Disbursement exceeds raised amount",
        message: `The disbursement amount (${amt.toLocaleString()}) exceeds the funds raised (${targetCampaign.amount_raised.toLocaleString()}) for this campaign. Proceed?`,
        confirmLabel: "Proceed",
        confirmClassName: "bg-orange-600 hover:bg-orange-700 text-white",
      });
      if (!confirmed) return;
    }

    setSubmittingDisbursement(true);
    try {
      // Step 1: Create disbursement record
      const disbursementRecord = await api.post("/admin/disbursements", {
        request_id: parseInt(selectedCampaignId),
        recipient_type: recipientType,
        recipient_name: recipientName,
        amount_disbursed: amt,
        payment_reference: paymentReference,
        disbursement_notes: disbursementNotes
      });

      // Step 2: Upload receipt file if provided
      if (evidenceFile) {
        await api.uploadFile(`/admin/disbursements/${disbursementRecord.disbursement_id}/evidence`, evidenceFile);
      }

      setDisburseSuccess("Disbursement logged successfully and student notification dispatched!");
      
      // Reset Form
      setSelectedCampaignId("");
      setRecipientType("school");
      setRecipientName("");
      setAmountDisbursed("");
      setPaymentReference("");
      setDisbursementNotes("");
      setEvidenceFile(null);

      // Refresh data
      await fetchDisbursementsData();
      await fetchDashboard();

      setTimeout(() => {
        setShowLogModal(false);
        setDisburseSuccess("");
      }, 2500);
    } catch (err) {
      setDisburseError(err.message || "Failed to log disbursement record.");
    } finally {
      setSubmittingDisbursement(false);
    }
  };

  const handleDirectEvidenceUpload = async (disbursementId, file) => {
    try {
      await api.uploadFile(`/admin/disbursements/${disbursementId}/evidence`, file);
      toast.success("Receipt evidence uploaded successfully!");
      fetchDisbursementsData();
    } catch (err) {
      toast.error("Failed to upload evidence: " + err.message);
    }
  };

  const viewDisbursementEvidence = async (disbursementId) => {
    try {
      const access = await api.get(`/admin/disbursements/${disbursementId}/evidence/access`);
      window.open(access.url.startsWith('http') ? access.url : `${API_URL}${access.url}`, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error("Unable to open disbursement evidence: " + err.message);
    }
  };

  const getRecipientTypeLabel = (type) => {
    switch (type) {
      case 'school': return 'Tuition Fund (School Direct)';
      case 'hostel': return 'Accommodation / Hostel Direct';
      case 'hospital': return 'Hospital / Medical bill Direct';
      case 'vendor': return 'Service Vendor / Bookstore Direct';
      case 'student_exception': return 'Direct Cash exception (Student Account)';
      default: return type;
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

  const { stats, recent_requests } = data;

  // Filter completed or reached target campaigns for logging dropdown
  const reachedCampaigns = allCampaigns.filter(c => c.campaign_status === "funded" || c.campaign_status === "closed" || c.amount_raised >= c.amount_needed);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-300">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Pending Requests</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.pending_requests}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-300">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Active Campaigns</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.approved_requests}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <HeartHandshake className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-300">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Verified Donations</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">₦{stats.total_donations_sum.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-300">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Registered Users</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.total_users}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          System Overview & Settings
        </button>
        <button
          onClick={() => {
            setActiveTab("disbursements");
            fetchDisbursementsData();
          }}
          className={`px-6 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "disbursements"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Disbursements tracking
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Recent Applications Activity */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4 transition-colors duration-300 lg:max-h-[calc(100vh-13rem)] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                Recent Applications
              </h4>
              <Link to="/admin/requests" className="text-xs font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                Review All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {recent_requests.length === 0 ? (
              <p className="text-xs text-slate-450 dark:text-slate-500 py-6 text-center">No student applications submitted yet.</p>
            ) : (
              <div className="space-y-3 lg:max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar pr-1">
                {recent_requests.map((r) => (
                  <div key={r.request_id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">{r.title}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">Date: {new Date(r.date_submitted).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right space-y-1.5 shrink-0">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                        r.application_status === 'approved' && r.campaign_status === 'active' ? 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' :
                        r.application_status === 'rejected' ? 'bg-red-50 dark:bg-red-955/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30' :
                        ['funded', 'closed'].includes(r.campaign_status) ? 'bg-blue-50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30' :
                        'bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                      }`}>
                        {r.application_status === 'approved' ? r.campaign_status : r.application_status}
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">₦{r.amount_needed.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Settings: Administration Payment Accounts */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300 lg:sticky lg:top-24 lg:self-start">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <Landmark className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                General Trust Account Settings
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Define account details visible to donors</p>
            </div>

            {!isSuperAdmin && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 text-[10px] font-semibold border border-amber-200 dark:border-amber-900/40 rounded-xl">
                Only super admins can edit these payment details. Normal admins can view them for reference.
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-300 dark:border-emerald-900/30 rounded-xl">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-955/20 text-red-800 dark:text-red-400 text-[10px] font-semibold border border-red-200 dark:border-red-900/30 rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveAccount} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Campus Trust Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  disabled={!isSuperAdmin}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. CampusAid Welfare Fund"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  disabled={!isSuperAdmin}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1012345678"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  disabled={!isSuperAdmin}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Instructions for Donors</label>
                <textarea
                  placeholder="Kindly specify reference ID in transfer..."
                  value={paymentInstruction}
                  onChange={(e) => setPaymentInstruction(e.target.value)}
                  disabled={!isSuperAdmin}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={savingAccount || !isSuperAdmin}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {savingAccount ? "Saving Account..." : "Save Payment Details"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DISBURSEMENTS */}
      {activeTab === "disbursements" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <Landmark className="h-4.5 w-4.5 text-blue-600 dark:text-blue-450" />
                Disbursement Allocations
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Manage fund disbursements directly to schools, accommodation hostels, or service vendors</p>
            </div>
            {user?.is_super_admin && <button
              onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Log Disbursement
            </button>}
          </div>

          {loadingDisbursements ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading disbursements history...</p>
            </div>
          ) : disbursements.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center rounded-2xl max-w-md mx-auto space-y-3 transition-colors duration-300">
              <Landmark className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto" />
              <h4 className="font-bold text-slate-700 dark:text-slate-350">No Disbursements Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-450">Fundraising disbursements will show up here once processed.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-colors duration-300">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 rounded-l-2xl">Campaign Campaign</th>
                      <th className="p-4">Recipient Details</th>
                      <th className="p-4">Amount Disbursed</th>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right rounded-r-2xl">Proof Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {disbursements.map((dis) => {
                      const relatedCampaign = allCampaigns.find(c => c.request_id === dis.request_id);
                      return (
                        <tr key={dis.disbursement_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{relatedCampaign?.title || `Campaign #${dis.request_id}`}</span>
                              <p className="text-[9px] text-slate-500 dark:text-slate-400">Purpose: {relatedCampaign?.purpose}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 dark:text-slate-100">{dis.recipient_name}</span>
                              <p className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">{getRecipientTypeLabel(dis.recipient_type)}</p>
                            </div>
                          </td>
                          <td className="p-4 font-extrabold text-slate-800 dark:text-slate-100 font-mono">₦{dis.amount_disbursed.toLocaleString()}</td>
                          <td className="p-4 font-mono text-slate-500 dark:text-slate-400">{dis.payment_reference}</td>
                          <td className="p-4 text-slate-500 dark:text-slate-400">{new Date(dis.disbursed_at).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                            {dis.evidence_access_available ? (
                              <button
                                type="button"
                                onClick={() => viewDisbursementEvidence(dis.disbursement_id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-lg font-bold hover:bg-blue-100/50 dark:hover:bg-blue-800/60 transition-all"
                              >
                                View File
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            ) : user?.is_super_admin ? (
                              <div className="relative inline-block">
                                <input
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  id={`file-upload-${dis.disbursement_id}`}
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      handleDirectEvidenceUpload(dis.disbursement_id, e.target.files[0]);
                                    }
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-350 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-[11px]">
                                  <Upload className="h-3 w-3" />
                                  Attach Receipt
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">Super admin only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DISBURSEMENT LOGGING MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full space-y-4 transition-colors duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <Landmark className="h-5 w-5 text-blue-600" />
                Log Campaign Disbursement
              </h4>
              <button
                onClick={() => {
                  setShowLogModal(false);
                  setDisburseError("");
                  setDisburseSuccess("");
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {disburseSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-955/20 text-emerald-800 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-300 dark:border-emerald-900/30 rounded-xl flex items-center gap-2 animate-fade-in">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                {disburseSuccess}
              </div>
            )}

            {disburseError && (
              <div className="p-3 bg-red-50 dark:bg-red-955/20 text-red-800 dark:text-red-400 text-[11px] font-semibold border border-red-200 dark:border-red-900/30 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                {disburseError}
              </div>
            )}

            <form onSubmit={handleLogDisbursementSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Select Campaign */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Select Target Campaign</label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => {
                      setSelectedCampaignId(e.target.value);
                      const campaign = allCampaigns.find(c => c.request_id === parseInt(e.target.value));
                      if (campaign) {
                        setAmountDisbursed(campaign.amount_raised.toString());
                        // Autofill recipient depending on purpose
                        if (campaign.purpose.toLowerCase().includes("tuition")) {
                          setRecipientType("school");
                        } else if (campaign.purpose.toLowerCase().includes("hostel") || campaign.purpose.toLowerCase().includes("accommodation")) {
                          setRecipientType("hostel");
                        } else if (campaign.purpose.toLowerCase().includes("medical")) {
                          setRecipientType("hospital");
                        } else {
                          setRecipientType("vendor");
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all cursor-pointer font-semibold"
                    required
                  >
                    <option value="">-- Choose Fully Funded Campaign --</option>
                    {reachedCampaigns.map((c) => (
                      <option key={c.request_id} value={c.request_id}>
                        {c.title} (Raised: ₦{c.amount_raised.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recipient Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Recipient Type</label>
                  <select
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all cursor-pointer font-semibold"
                    required
                  >
                    <option value="school">Tuition Fund (School Direct)</option>
                    <option value="hostel">Accommodation / Hostel Direct</option>
                    <option value="hospital">Hospital / Medical Bill Direct</option>
                    <option value="vendor">Service Vendor / Bookstore Direct</option>
                    <option value="student_exception">Student Direct Account (Exception Case)</option>
                  </select>
                </div>

                {/* Recipient Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. University Registry, Block B Hostel Manager"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-semibold"
                    required
                  />
                </div>

                {/* Amount Disbursed */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Amount Disbursed (₦)</label>
                  <input
                    type="number"
                    placeholder="Amount logged"
                    value={amountDisbursed}
                    onChange={(e) => setAmountDisbursed(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-semibold"
                    required
                  />
                </div>

                {/* Payment Reference */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Payment Reference / Bank ID</label>
                  <input
                    type="text"
                    placeholder="e.g. TX-90281-DISB"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-semibold"
                    required
                  />
                </div>

                {/* Evidence File */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Upload Receipt Evidence (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setEvidenceFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40 p-2 cursor-pointer font-semibold"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Disbursement Notes</label>
                  <textarea
                    placeholder="Additional context or notes regarding this payment record..."
                    value={disbursementNotes}
                    onChange={(e) => setDisbursementNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogModal(false);
                    setDisburseError("");
                    setDisburseSuccess("");
                  }}
                  className="px-4.5 py-2 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all border border-slate-200/80 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDisbursement}
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  {submittingDisbursement ? "Logging..." : "Confirm & Disburse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;

