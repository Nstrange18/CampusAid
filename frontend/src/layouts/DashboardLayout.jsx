import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, HeartHandshake, History, User, Bell, 
  PlusCircle, CheckSquare, DollarSign, FileBarChart, 
  Users, LogOut, Menu, X, ChevronRight, GraduationCap
} from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationLinks = () => {
    switch (user.role) {
      case 'student':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'New Request', path: '/student/requests/new', icon: PlusCircle },
          { name: 'Profile Settings', path: '/profile', icon: User },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'donor':
        return [
          { name: 'Dashboard', path: '/donor/dashboard', icon: LayoutDashboard },
          { name: 'Browse Campaigns', path: '/campaigns', icon: HeartHandshake },
          { name: 'Donation History', path: '/donor/history', icon: History },
          { name: 'Profile Settings', path: '/profile', icon: User },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Pending Applications', path: '/admin/requests', icon: CheckSquare },
          { name: 'Manage Campaigns', path: '/admin/campaigns', icon: HeartHandshake },
          { name: 'Verify Donations', path: '/admin/donations', icon: DollarSign },
          { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
          { name: 'Manage Users', path: '/admin/users', icon: Users },
          { name: 'Profile Settings', path: '/profile', icon: User },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const links = getNavigationLinks();

  const getPageTitle = () => {
    const currentLink = links.find(link => link.path === location.pathname);
    if (currentLink) return currentLink.name;
    if (location.pathname.includes('/campaigns/')) return 'Campaign Details';
    if (location.pathname.includes('/review')) return 'Application Review';
    if (location.pathname.includes('/checklist')) return 'Verification Checklist';
    if (location.pathname.includes('/upload')) return 'Document Upload';
    return 'CampusAid Portal';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-white flex-col border-r border-slate-800 shadow-xl transition-all duration-300">
        <div className="p-6 flex items-center gap-3 bg-slate-950">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent">CampusAid</h1>
            <p className="text-[10px] text-slate-400 tracking-widest uppercase">Student Welfare</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-105 duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{link.name}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-semibold text-sm border border-blue-500/30 uppercase">
              {user.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.full_name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-slate-800/80 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/40 text-slate-300 border border-slate-700/50 rounded-lg text-xs font-medium transition-all duration-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu & Drawer */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md z-20">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-500" />
          <span className="font-bold text-lg">CampusAid</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-1 hover:bg-slate-800 rounded-lg"
        >
          <Menu className="h-6 w-6 text-slate-300" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-4/5 max-w-xs bg-slate-900 text-white h-full shadow-2xl p-6 transition-transform duration-300 z-50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                <span className="font-bold text-lg">CampusAid</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="h-6 w-6 text-slate-300" />
              </button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-6 border-t border-slate-850 mt-auto flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-semibold text-sm">
                  {user.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.full_name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 text-slate-300 border border-slate-700/50 rounded-lg text-xs font-medium transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 capitalize">{getPageTitle()}</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 uppercase tracking-wider">
              {user.role} Portal
            </span>
            <div className="h-5 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                {user.full_name.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-slate-700">{user.full_name}</span>
            </div>
          </div>
        </header>

        {/* Dynamic page title for mobile */}
        <div className="md:hidden px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 capitalize">{getPageTitle()}</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 uppercase">
            {user.role}
          </span>
        </div>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
