import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Calendar, Shield, User, Heart, LinkIcon, Copy, Check, Clock, XCircle, CheckCircle2, Plus } from 'lucide-react';

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [inviteLinks, setInviteLinks] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const isSuperAdmin = currentUser?.is_super_admin === true;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.get("/admin/users");
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch invite links for super admins
  useEffect(() => {
    if (!isSuperAdmin) return;
    const fetchInvites = async () => {
      setInviteLoading(true);
      try {
        const data = await api.getInviteLinks();
        setInviteLinks(data);
      } catch (err) {
        console.error("Failed to load invite links:", err);
      } finally {
        setInviteLoading(false);
      }
    };
    fetchInvites();
  }, [isSuperAdmin]);

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    setGeneratedLink("");
    setCopied(false);
    try {
      const invite = await api.generateInviteLink();
      const link = `${window.location.origin}/admin/invite/${invite.token}`;
      setGeneratedLink(link);
      // Refresh invite list
      const data = await api.getInviteLinks();
      setInviteLinks(data);
    } catch (err) {
      console.error("Failed to generate invite link:", err);
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = generatedLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getInviteStatus = (invite) => {
    if (invite.is_used) {
      return { label: "Used", color: "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800", icon: CheckCircle2 };
    }
    if (new Date(invite.expires_at) < new Date()) {
      return { label: "Expired", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40", icon: XCircle };
    }
    return { label: "Active", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40", icon: Clock };
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 rounded uppercase"><Shield className="h-2.5 w-2.5" /> Admin</span>;
      case 'student':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold bg-blue-50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30 rounded uppercase"><User className="h-2.5 w-2.5" /> Student</span>;
      case 'donor':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded uppercase"><Heart className="h-2.5 w-2.5" /> Donor</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[9px] font-bold bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 rounded uppercase">{role}</span>;
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">User Directory</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage registered students, contributors, and academic administrators</p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3 transition-colors duration-300">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all font-semibold"
          />
        </div>

        {/* Role */}
        <div className="relative w-full md:w-48">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Users className="h-4 w-4" />
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:text-slate-100 dark:focus:border-blue-500 transition-all cursor-pointer font-semibold"
          >
            <option value="all" className="dark:bg-slate-900">All Roles</option>
            <option value="student" className="dark:bg-slate-900">Students</option>
            <option value="donor" className="dark:bg-slate-900">Donors</option>
            <option value="admin" className="dark:bg-slate-900">Administrators</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading user records...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl max-w-md mx-auto space-y-2 transition-colors duration-300">
          <Users className="h-10 w-10 text-slate-400 dark:text-slate-655 mx-auto" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300">No users found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-450">There are no user profiles matching your filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop Users Table */}
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 rounded-l-2xl">User details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Profile credentials</th>
                    <th className="p-4 rounded-r-2xl">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.user_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{u.full_name}</span>
                      </td>
                      <td className="p-4">{getRoleBadge(u.role)}</td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span>{u.email}</span>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500">{u.phone_number}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {u.role === 'student' && (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Matric: {u.details.matric_number}</span>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400">{u.details.department} • {u.details.level}</p>
                          </div>
                        )}
                        {u.role === 'donor' && (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Type: <span className="capitalize">{u.details.donor_type}</span></span>
                            {u.details.organization_name && <p className="text-[9px] text-slate-400 dark:text-slate-500">Org: {u.details.organization_name}</p>}
                          </div>
                        )}
                        {u.role === 'admin' && (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Staff ID: {u.details.staff_id}</span>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500">Pos: {u.details.position}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Users Cards Grid */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredUsers.map((u) => (
              <div key={u.user_id} className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 transition-colors duration-300">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{u.full_name}</h4>
                  {getRoleBadge(u.role)}
                </div>

                <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

                <div className="space-y-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <p><span className="text-slate-400 dark:text-slate-500">Email:</span> {u.email}</p>
                  <p><span className="text-slate-400 dark:text-slate-500">Phone:</span> {u.phone_number}</p>
                  
                  {u.role === 'student' && (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-0.5 mt-2 text-[10px]">
                      <p><span className="font-bold text-slate-500 dark:text-slate-400">Matric:</span> {u.details.matric_number}</p>
                      <p><span className="font-bold text-slate-500 dark:text-slate-400">Dept:</span> {u.details.department} • {u.details.level}</p>
                    </div>
                  )}

                  {u.role === 'donor' && (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-0.5 mt-2 text-[10px]">
                      <p><span className="font-bold text-slate-500 dark:text-slate-400">Type:</span> <span className="capitalize">{u.details.donor_type}</span></p>
                      {u.details.organization_name && <p><span className="font-bold text-slate-500 dark:text-slate-400">Org:</span> {u.details.organization_name}</p>}
                    </div>
                  )}

                  {u.role === 'admin' && (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-0.5 mt-2 text-[10px]">
                      <p><span className="font-bold text-slate-500 dark:text-slate-400">Staff ID:</span> {u.details.staff_id}</p>
                      <p><span className="font-bold text-slate-500 dark:text-slate-400">Pos:</span> {u.details.position}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Calendar className="h-3.5 w-3.5" /> Registered: {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Super Admin: Invite Management Section */}
      {isSuperAdmin && (
        <div className="space-y-4 pt-6 mt-6 border-t-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                Admin Invite Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Generate one-time invite links for new administrators</p>
            </div>
            <button
              onClick={handleGenerateLink}
              disabled={generatingLink}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 transform active:scale-95"
            >
              {generatingLink ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Generate Invite Link
                </>
              )}
            </button>
          </div>

          {/* Generated link display */}
          {generatedLink && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <LinkIcon className="h-4 w-4" />
                Invite Link Generated Successfully
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  {copied ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </button>
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500">
                This link is valid for 48 hours and can only be used once. Share it securely with the intended administrator.
              </p>
            </div>
          )}

          {/* Invite links history table */}
          {inviteLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-emerald-500 border-t-transparent mb-2"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading invite history...</p>
            </div>
          ) : inviteLinks.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-colors duration-300">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4">Token</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Created</th>
                      <th className="p-4">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {inviteLinks.map((inv) => {
                      const status = getInviteStatus(inv);
                      const StatusIcon = status.icon;
                      return (
                        <tr key={inv.token_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                            {inv.token.substring(0, 8)}...{inv.token.substring(inv.token.length - 4)}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold border rounded uppercase ${status.color}`}>
                              <StatusIcon className="h-2.5 w-2.5" />
                              {status.label}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 dark:text-slate-400">
                            {new Date(inv.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-slate-500 dark:text-slate-400">
                            {new Date(inv.expires_at).toLocaleDateString()} {new Date(inv.expires_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center rounded-2xl space-y-2 transition-colors duration-300">
              <LinkIcon className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No invite links generated yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminUsers;
