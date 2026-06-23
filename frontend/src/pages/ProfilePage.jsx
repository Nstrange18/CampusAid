import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { User, Phone, Mail, GraduationCap, BookOpen, Layers, Landmark, Save, CheckCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState("");
  const [level, setLevel] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhoneNumber(user.phone_number || "");
      setMatricNumber(user.matric_number || "");
      setDepartment(user.department || "");
      setFaculty(user.faculty || "");
      setLevel(user.level || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      if (user.role === 'student') {
        await api.put("/students/profile", {
          full_name: fullName,
          phone_number: phoneNumber,
          matric_number: matricNumber,
          department: department,
          faculty: faculty,
          level: level
        });
      } else {
        // Simple mock/profile update for admin & donor
        // For simplicity, they edit user table profile details
        // In backend, student/profile modifies both User and Student.
        // Let's create an endpoint in student/profile, and if we want we can expand it.
        // For admin/donor, they can view details, editing is a plus.
        // Let's support editing for students.
      }
      
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl border-4 border-blue-50">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">{user.full_name}</h3>
            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
          </div>
          <div className="w-full h-[1px] bg-slate-100" />
          
          <div className="w-full space-y-3 text-left">
            <div className="flex items-center gap-3 text-slate-600 text-xs">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 text-xs">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{user.phone_number}</span>
            </div>
            {user.role === 'student' && (
              <div className="flex items-center gap-3 text-slate-600 text-xs">
                <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Matric: {user.matric_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-850 border-b border-slate-100 pb-3">Update Profile Settings</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                    disabled={user.role !== 'student'} // Edit allowed for students, others are static for now
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                    disabled={user.role !== 'student'}
                    required
                  />
                </div>
              </div>

              {user.role === 'student' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Matric Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <GraduationCap className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={matricNumber}
                        onChange={(e) => setMatricNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Faculty</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Landmark className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Department</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Academic Level</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Layers className="h-4 w-4" />
                      </span>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
                        required
                      >
                        <option>100 Level</option>
                        <option>200 Level</option>
                        <option>300 Level</option>
                        <option>400 Level</option>
                        <option>500 Level</option>
                        <option>600 Level</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {user.role === 'student' ? (
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md shadow-blue-500/10 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? "Saving Changes..." : "Save Profile Details"}
              </button>
            ) : (
              <p className="text-[10px] text-slate-400 italic">
                Only student profiles are dynamically editable in this release. Contact IT for administrative changes.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
