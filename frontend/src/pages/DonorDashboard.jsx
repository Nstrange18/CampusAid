import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Heart, Clock, CheckCircle, ArrowRight, History, HeartHandshake } from 'lucide-react';

export const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const verifiedDonations = donations.filter(d => d.verification_status === 'verified');
  const pendingDonations = donations.filter(d => d.verification_status === 'pending');

  const totalContributed = verifiedDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Verified Support</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">₦{totalContributed.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Pending Verification</span>
            <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
            {pendingDonations.length} <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Record(s)</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 transition-colors duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Campaigns Supported</span>
            <Heart className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
            {new Set(donations.map(d => d.request_id)).size} <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Student(s)</span>
          </p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contributions list */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4 transition-colors duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-blue-600 dark:text-blue-450" />
              Recent Donations
            </h4>
            <Link to="/donor/history" className="text-xs font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-0.5">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mb-1"></div>
              <p className="text-xs text-slate-450">Loading records...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 space-y-3">
              <HeartHandshake className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-xs">No donation history recorded yet.</p>
              <Link
                to="/campaigns"
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Browse Campaigns
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.slice(0, 4).map((d) => (
                <div key={d.donation_id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-200 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">Ref: {d.transaction_reference}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Date: {new Date(d.donation_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right space-y-1.5 shrink-0">
                    <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">₦{d.amount.toLocaleString()}</p>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                      d.verification_status === 'verified' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' :
                      d.verification_status === 'rejected' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30' :
                      'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                    }`}>
                      {d.verification_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to support box */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <HeartHandshake className="h-10 w-10 text-blue-400" />
            <h4 className="font-bold text-base">Make a Difference Today</h4>
            <p className="text-xs text-blue-200 leading-relaxed">
              Support verified disability-related needs such as assistive technology, accessible learning materials, mobility, and accommodation.
            </p>
          </div>
          <Link
            to="/campaigns"
            className="w-full py-3 bg-white hover:bg-blue-600 hover:text-white text-slate-900 rounded-xl text-xs font-extrabold tracking-wide transition-all shadow-md flex items-center justify-center gap-1"
          >
            Explore Campaigns
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default DonorDashboard;
