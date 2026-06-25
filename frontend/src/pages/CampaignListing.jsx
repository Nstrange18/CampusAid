import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { HeartHandshake, Search, Layers, Clock, AlertCircle } from 'lucide-react';

export const CampaignListing = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await api.get("/campaigns");
        setCampaigns(data);
      } catch (err) {
        console.error("Error loading campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.purpose === categoryFilter;
    const matchesUrgency = urgencyFilter === "all" || c.urgency_level === urgencyFilter;
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Support Student Campaigns</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Back verified academic welfare requests</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3 transition-colors duration-300">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all"
          />
        </div>

        {/* Category */}
        <div className="relative w-full md:w-48">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Layers className="h-4 w-4" />
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Tuition Fees">Tuition Fees</option>
            <option value="Books & Materials">Books & Materials</option>
            <option value="Accommodation & Hostel">Accommodation & Hostel</option>
            <option value="Medical Aid">Medical Aid</option>
            <option value="General Welfare">General Welfare</option>
          </select>
        </div>

        {/* Urgency */}
        <div className="relative w-full md:w-48">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Clock className="h-4 w-4" />
          </span>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading campaigns...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center rounded-2xl max-w-md mx-auto space-y-3 transition-colors duration-300">
          <HeartHandshake className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300">No campaigns found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-450">No active campaigns match your selected search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((c) => {
            const percent = Math.min(100, Math.round((c.amount_raised / c.amount_needed) * 100));
            return (
              <div key={c.request_id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 rounded text-[10px] font-bold uppercase">
                      {c.purpose}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      c.urgency_level === 'high' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30' :
                      c.urgency_level === 'medium' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30' :
                      'bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
                    }`}>
                      {c.urgency_level}
                    </span>
                  </div>

                  <div className="space-y-1 flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-105 text-sm leading-snug line-clamp-2">{c.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{c.description}</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Raised: ₦{c.amount_raised.toLocaleString()}</span>
                      <span className="text-slate-700 dark:text-slate-300">Goal: ₦{c.amount_needed.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950/40 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="text-[10px] text-right font-bold text-blue-600 dark:text-blue-400">{percent}% Funded</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Verified Welfare Fund</span>
                  <Link
                    to={`/campaigns/${c.request_id}`}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default CampaignListing;
