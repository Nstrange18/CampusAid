import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { Landmark, ArrowLeft, HeartHandshake, AlertCircle, ShieldAlert, Award, FileText } from 'lucide-react';

export const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/campaigns/${id}`);
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
        <p className="text-sm text-slate-500">Loading campaign details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-200 dark:border-red-900/40 text-center space-y-4 max-w-md mx-auto transition-colors duration-300">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h4 className="font-bold text-red-800 dark:text-red-400">Error Loading Campaign</h4>
        <p className="text-xs text-red-700 dark:text-slate-300">{error || "Record not found"}</p>
        <button onClick={() => navigate('/campaigns')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold">
          Back to Listing
        </button>
      </div>
    );
  }

  const { campaign, student, admin_payment_accounts } = data;
  const percent = Math.min(100, Math.round((campaign.amount_raised / campaign.amount_needed) * 100));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/campaigns')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Campaign Details</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Review student statements and payment instructions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Campaign Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded-lg text-xs font-bold capitalize">
                {campaign.purpose}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                campaign.urgency_level === 'high' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30' :
                campaign.urgency_level === 'medium' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30' :
                'bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
              }`}>
                {campaign.urgency_level} urgency
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">{campaign.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Student Profile: {student.full_name} ({student.department}, {student.level})
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pt-2">
                {campaign.description}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Supporting Statement & Reason
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                "{campaign.supporting_statement}"
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
                <span className="font-semibold text-slate-700 dark:text-slate-350">Reason for Request:</span> {campaign.reason_for_request}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-slate-350">Parent/Guardian Occupation:</span> {campaign.parent_or_guardian_occupation}
              </p>
            </div>
          </div>

          {/* Direct transfer accounts instructions */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Landmark className="h-4.5 w-4.5 text-blue-600 dark:text-blue-450" />
              Transfer Channels (External Payments Only)
            </h4>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              CampusAid facilitates manual payments. Please make external payments only to the official school/administrator-managed donation account below. After transferring, upload your payment proof/receipt to update the campaign.
            </p>

            <div className="pt-2">
              {/* Admin Donation Account */}
              <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-200 dark:border-indigo-900/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">✓</span>
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">Official Admin/School General Account</h5>
                </div>
                {admin_payment_accounts.length === 0 ? (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No admin accounts configured</p>
                ) : (
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-medium">
                    <p><span className="font-semibold text-slate-500 dark:text-slate-400">Bank:</span> {admin_payment_accounts[0].bank_name}</p>
                    <p><span className="font-semibold text-slate-500 dark:text-slate-400">Account Name:</span> {admin_payment_accounts[0].account_name}</p>
                    <p><span className="font-semibold text-slate-500 dark:text-slate-400">Account Number:</span> {admin_payment_accounts[0].account_number}</p>
                  </div>
                )}
              </div>
            </div>

            {admin_payment_accounts.length > 0 && admin_payment_accounts[0].payment_instruction && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldAlert className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Payment Memo Instruction:</span> {admin_payment_accounts[0].payment_instruction}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Support Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors duration-300">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">Campaign Progress</h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Target Needed:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">₦{campaign.amount_needed.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Amount Raised:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₦{campaign.amount_raised.toLocaleString()}</span>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="w-full bg-slate-100 dark:bg-slate-900/40 rounded-full h-2 border border-slate-300 dark:border-slate-800 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  <span>{percent}% Funded</span>
                  <span>₦{(campaign.amount_needed - campaign.amount_raised).toLocaleString()} left</span>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

            {campaign.status === "completed" ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 text-xs font-bold rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                Campaign completed! target reached.
              </div>
            ) : (
              <Link
                to={`/donor/donations/${campaign.request_id}/upload-proof`}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1"
              >
                <HeartHandshake className="h-4 w-4" />
                Record Donation Proof
              </Link>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors duration-300">
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-500" />
              Campus Verification Guard
            </h5>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              This request was fully reviewed by the Dean of Student Affairs. Academic standing and indigent status documents are audited and held in campus trust storage.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
export default CampaignDetails;
