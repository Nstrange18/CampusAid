import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { GraduationCap, HeartHandshake, ShieldCheck, ArrowRight, Search, Sparkles, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BrandMark } from '../components/BrandMark';

export const LandingPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.purpose.toLowerCase().includes(search.toLowerCase()),
  );

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 transform active:scale-95 active:rotate-12"
      title={`Toggle ${theme === "light" ? "Dark" : "Light"} Mode`}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Top Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-10 w-10" iconClassName="h-7 w-7" />
            <div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-slate-100 tracking-tight transition-colors duration-300">
                CampusAid
              </span>
              <span className="block text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider -mt-1 transition-colors duration-300">
                Disability Support
              </span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link
                to={
                  user.role === "student"
                    ? "/student/dashboard"
                    : user.role === "donor"
                      ? "/donor/dashboard"
                      : "/admin/dashboard"
                }
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm transform active:scale-98"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-500/10 transform active:scale-98"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-inner animate-fade-in transition-colors duration-300">
            <div className="px-4 pt-3 pb-4 space-y-2">
              {user ? (
                <Link
                  to={
                    user.role === "student"
                      ? "/student/dashboard"
                      : user.role === "donor"
                        ? "/donor/dashboard"
                        : "/admin/dashboard"
                  }
                  className="block w-full text-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="block w-full text-center py-2.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-sm font-semibold transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-500/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <header className="relative bg-slate-950 text-white py-20 px-4 text-center overflow-hidden">
        <img
          src="/campusaid-hero.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_75%_at_50%_45%,rgba(15,23,42,0.82),rgba(15,23,42,0.18))]" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-400/30 rounded-full text-blue-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            Empowering Higher Education
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Supporting Students with Physical Disabilities<br />
            <span className="bg-linear-to-r from-blue-300 via-indigo-300 to-sky-300 bg-clip-text text-transparent animate-pulse">Through Structured Aid</span>
          </h1>
          <p className="text-slate-200 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            CampusAid connects financially constrained students with verified campus administrators and generous donors. Securely managed, verified, and transparent.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 group transform active:scale-98"
            >
              Start Fundraising
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#campaigns" 
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-slate-900/65 hover:bg-slate-800/80 text-slate-100 rounded-xl font-bold border border-slate-500/60 backdrop-blur-sm transition-all cursor-pointer"
            >
              Browse Campaigns
            </a>
          </div>
        </div>
      </header>

      {/* Info/Process section */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 text-center mb-12 transition-colors duration-300">
          Structured Fundraising Workflow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-all duration-300">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              1. Student Application
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Students privately submit an accepted disability-evidence pathway
              and describe the support needed to participate fully in campus
              life.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-all duration-300">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              2. Admin Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Authorized administrators review restricted evidence and publish
              only the student-approved campaign story.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-all duration-300">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <HeartHandshake className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              3. Direct External Donation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Donors make payments through administrator-provided payment
              routes, submit receipts, and watch campaign progress bars reach
              completion.
            </p>
          </div>
        </div>
      </section>

      {/* Campaigns Listing */}
      <section
        id="campaigns"
        className="bg-slate-100/50 dark:bg-slate-900/20 py-16 px-4 border-t border-slate-200/85 dark:border-slate-800 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Active Campaigns
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Support verified students on their academic journey
              </p>
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
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100 dark:focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
              <p className="text-sm text-slate-500">
                Loading campaign listings...
              </p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 text-center py-16 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto p-6">
              <HeartHandshake className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">
                No campaigns found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try refining your search keyword or check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCampaigns.map((c) => {
                const percent = Math.min(
                  100,
                  Math.round((c.amount_raised / c.amount_needed) * 100),
                );
                return (
                  <div
                    key={c.request_id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300/80 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="p-6 flex-1 flex flex-col space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 rounded-lg text-xs font-bold capitalize">
                          {c.purpose}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            c.urgency_level === "high"
                              ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40"
                              : c.urgency_level === "medium"
                                ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40"
                                : "bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800"
                          }`}
                        >
                          {c.urgency_level} Priority
                        </span>
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 transition-colors">
                          {c.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-450 line-clamp-3 leading-relaxed transition-colors">
                          {c.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-500 dark:text-slate-400">
                            Raised: ₦{c.amount_raised.toLocaleString()}
                          </span>
                          <span className="text-slate-800 dark:text-slate-200">
                            Goal: ₦{c.amount_needed.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-right font-bold text-blue-600 dark:text-blue-450">
                          {percent}% Funded
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        Published via CampusAid
                      </span>
                      <Link
                        to={
                          user && user.role === "donor"
                            ? `/campaigns/${c.request_id}`
                            : "/login"
                        }
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group"
                      >
                        {user && user.role === "donor"
                          ? "Support Student"
                          : "Login to Support"}
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
      <footer className="mt-auto bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-500 py-12 px-4 border-t border-slate-200 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BrandMark className="h-9 w-9" iconClassName="h-6 w-6" />
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">CampusAid</span>
          </div>
          <p className="text-xs text-center md:text-right">
            &copy; 2026 CampusAid Welfare Management System. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
