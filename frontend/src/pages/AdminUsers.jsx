import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Users, Search, Calendar, Shield, User, Heart } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-150 rounded uppercase"><Shield className="h-2.5 w-2.5" /> Admin</span>;
      case 'student':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-150 rounded uppercase"><User className="h-2.5 w-2.5" /> Student</span>;
      case 'donor':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 rounded uppercase"><Heart className="h-2.5 w-2.5" /> Donor</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-100 rounded uppercase">{role}</span>;
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
        <h3 className="text-lg font-bold text-slate-800">User Directory</h3>
        <p className="text-xs text-slate-500">Manage registered students, contributors, and academic administrators</p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
          />
        </div>

        {/* Role */}
        <div className="relative w-full md:w-48">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Users className="h-4 w-4" />
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="donor">Donors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
          <p className="text-sm text-slate-500">Loading user records...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl max-w-md mx-auto space-y-2">
          <Users className="h-10 w-10 text-slate-350 mx-auto" />
          <h4 className="font-bold text-slate-700">No users found</h4>
          <p className="text-xs text-slate-500">There are no user profiles matching your filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop Users Table */}
          <div className="hidden md:block bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150">
                    <th className="p-4 rounded-l-2xl">User details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Profile credentials</th>
                    <th className="p-4 rounded-r-2xl">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUsers.map((u) => (
                    <tr key={u.user_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-800">{u.full_name}</span>
                      </td>
                      <td className="p-4">{getRoleBadge(u.role)}</td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span>{u.email}</span>
                          <p className="text-[9px] text-slate-400">{u.phone_number}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {u.role === 'student' && (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700">Matric: {u.details.matric_number}</span>
                            <p className="text-[9px] text-slate-450">{u.details.department} • {u.details.level}</p>
                          </div>
                        )}
                        {u.role === 'donor' && (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-750">Type: <span className="capitalize">{u.details.donor_type}</span></span>
                            {u.details.organization_name && <p className="text-[9px] text-slate-400">Org: {u.details.organization_name}</p>}
                          </div>
                        )}
                        {u.role === 'admin' && (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-750">Staff ID: {u.details.staff_id}</span>
                            <p className="text-[9px] text-slate-400">Pos: {u.details.position}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-500">
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
              <div key={u.user_id} className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-slate-805 text-xs">{u.full_name}</h4>
                  {getRoleBadge(u.role)}
                </div>

                <div className="h-[1px] bg-slate-105" />

                <div className="space-y-1.5 text-[11px] font-semibold text-slate-600">
                  <p><span className="text-slate-400">Email:</span> {u.email}</p>
                  <p><span className="text-slate-400">Phone:</span> {u.phone_number}</p>
                  
                  {u.role === 'student' && (
                    <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl space-y-0.5 mt-2 text-[10px]">
                      <p><span className="font-bold text-slate-500">Matric:</span> {u.details.matric_number}</p>
                      <p><span className="font-bold text-slate-500">Dept:</span> {u.details.department} • {u.details.level}</p>
                    </div>
                  )}

                  {u.role === 'donor' && (
                    <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl space-y-0.5 mt-2 text-[10px]">
                      <p><span className="font-bold text-slate-500">Type:</span> <span className="capitalize">{u.details.donor_type}</span></p>
                      {u.details.organization_name && <p><span className="font-bold text-slate-500">Org:</span> {u.details.organization_name}</p>}
                    </div>
                  )}

                  {u.role === 'admin' && (
                    <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl space-y-0.5 mt-2 text-[10px]">
                      <p><span className="font-bold text-slate-500">Staff ID:</span> {u.details.staff_id}</p>
                      <p><span className="font-bold text-slate-500">Pos:</span> {u.details.position}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <Calendar className="h-3.5 w-3.5" /> Registered: {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
export default AdminUsers;
