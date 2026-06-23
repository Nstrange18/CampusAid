import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { GraduationCap, HeartHandshake, ShieldCheck, ArrowRight, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.purpose.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">CampusAid</span>
              <span className="block text-[9px] text-blue-600 font-bold uppercase tracking-wider -mt-1">Indigent Support</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                to={user.role === 'student' ? '/student/dashboard' : user.role === 'donor' ? '/donor/dashboard' : '/admin/dashboard'}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-blue-600 text-sm font-semibold transition-colors">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-500/10"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.18),rgba(255,255,255,0))]" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            Empowering Higher Education
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Supporting Indigent Students<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">Through Structured Aid</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            CampusAid connects financially constrained students with verified campus administrators and generous donors. Securely managed, verified, and transparent.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 group"
            >
              Start Fundraising
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#campaigns" 
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 rounded-xl font-bold border border-slate-700 backdrop-blur-sm transition-all"
            >
              Browse Campaigns
            </a>
          </div>
        </div>
      </header>

      {/* Info/Process section */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center mb-12">
          Structured Fundraising Workflow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">1. Student Application</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Students submit verification documents (invoice bills, advisership recommendation, etc.) outlining financial need and target goals.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">2. Admin Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Campus administrators review student credentials, complete an indigent status checklist, and approve genuine requests into public campaigns.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <HeartHandshake className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">3. Direct External Donation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Donors make payments through administrator-provided payment routes, submit receipts, and watch campaign progress bars reach completion.
            </p>
          </div>
        </div>
      </section>

      {/* Campaigns Listing */}
      <section id="campaigns" className="bg-slate-100/50 py-16 px-4 border-t border-slate-200/85">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Active Campaigns</h2>
              <p className="text-xs text-slate-500 mt-1">Support verified students on their academic journey</p>
            </div>
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search tuition, books, accommodation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
              <p className="text-sm text-slate-500">Loading campaign listings...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-white text-center py-16 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto p-6">
              <HeartHandshake className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700">No campaigns found</h3>
              <p className="text-xs text-slate-500 mt-1">Try refining your search keyword or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCampaigns.map((c) => {
                const percent = Math.min(100, Math.round((c.amount_raised / c.amount_needed) * 100));
                return (
                  <div key={c.request_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 overflow-hidden flex flex-col">
                    <div className="p-6 flex-1 flex flex-col space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold capitalize">
                          {c.purpose}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          c.urgency_level === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                          c.urgency_level === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {c.urgency_level} Priority
                        </span>
                      </div>
                      
                      <div className="space-y-1.5 flex-1">
                        <h3 className="font-bold text-slate-800 leading-snug line-clamp-2">{c.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{c.description}</p>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-500">Raised: ₦{c.amount_raised.toLocaleString()}</span>
                          <span className="text-slate-800">Goal: ₦{c.amount_needed.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div 
                            className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-right font-bold text-blue-600">{percent}% Funded</div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Published via CampusAid</span>
                      <Link
                        to={user && user.role === 'donor' ? `/campaigns/${c.request_id}` : '/login'}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 group"
                      >
                        {user && user.role === 'donor' ? 'Support Student' : 'Login to Support'}
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-850">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-500" />
            <span className="font-extrabold text-lg text-white">CampusAid</span>
          </div>
          <p className="text-xs text-center md:text-right">&copy; 2026 CampusAid Welfare Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
