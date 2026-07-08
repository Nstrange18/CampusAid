import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, User, Phone, Mail, Lock, FileText, Briefcase, Sun, Moon, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../api';

const adminInviteSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  staffId: z.string().min(1, "Staff ID is required"),
  position: z.string().min(1, "Position is required"),
});

export const AdminInviteRegisterPage = () => {
  const { token } = useParams();
  const { registerViaInvite, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(adminInviteSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      staffId: "",
      position: ""
    }
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'donor') navigate('/donor/dashboard');
    }
  }, [user]);

  // Validate the invite token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const result = await api.validateInviteToken(token);
        if (result.valid) {
          setTokenValid(true);
          setExpiresAt(result.expires_at);
        } else {
          setTokenValid(false);
          setTokenError(result.reason || "This invite link is invalid.");
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError("Unable to validate invite link. Please try again later.");
      } finally {
        setValidating(false);
      }
    };
    validateToken();
  }, [token]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await registerViaInvite({
        token: token,
        full_name: data.fullName,
        email: data.email,
        phone_number: data.phoneNumber,
        password: data.password,
        staff_id: data.staffId,
        position: data.position,
      });
      toast.success("Admin account created successfully! Welcome to CampusAid.");
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMsg = err.message || "Registration failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validating) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Validating invite link...</p>
        </div>
      </div>
    );
  }

  // Invalid/expired token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300 relative">
        {/* Theme toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 transition-all transform active:scale-95 duration-300"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl/40 max-w-md w-full space-y-6 text-center transition-all duration-300">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/40">
              <XCircle className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100">
              Invalid Invite Link
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {tokenError}
            </p>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 text-left">
                Admin registration requires a valid, one-time invite link from a Super Administrator. 
                Please contact your system administrator for a new invite link.
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-md shadow-blue-500/10 text-center"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Valid token — show the admin registration form
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 md:py-12 transition-colors duration-300 relative">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 transition-all transform active:scale-95 duration-300"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl/40 max-w-xl w-full space-y-6 transition-all duration-300">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center transition-colors duration-300">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 transition-colors duration-300">
            Admin Registration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
            You've been invited to join CampusAid as an Administrator
          </p>
          {expiresAt && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              This invite expires on {new Date(expiresAt).toLocaleDateString()} at {new Date(expiresAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Invite badge */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            Verified invite link — complete the form below to create your administrator account.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl text-center animate-fade-in transition-colors duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest transition-colors duration-300">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors duration-300">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    {...register("fullName")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all dark:text-slate-100 ${
                      errors.fullName 
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                        : 'border-slate-300 dark:border-slate-800 focus:ring-emerald-500/25 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors duration-300">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    placeholder="+234..."
                    {...register("phoneNumber")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all dark:text-slate-100 ${
                      errors.phoneNumber 
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                        : 'border-slate-300 dark:border-slate-800 focus:ring-emerald-500/25 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors duration-300">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="admin@school.edu"
                    {...register("email")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all dark:text-slate-100 ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                        : 'border-slate-300 dark:border-slate-800 focus:ring-emerald-500/25 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors duration-300">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all dark:text-slate-100 ${
                      errors.password 
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                        : 'border-slate-300 dark:border-slate-800 focus:ring-emerald-500/25 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100 dark:bg-slate-800 transition-colors duration-300" />

          {/* Admin Credentials */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
              Administrator Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Staff ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FileText className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="STF/2026/001"
                    {...register("staffId")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all dark:text-slate-100 ${
                      errors.staffId 
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                        : 'border-slate-300 dark:border-slate-800 focus:ring-emerald-500/25 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.staffId && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.staffId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Position</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Dean of Students"
                    {...register("position")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all dark:text-slate-100 ${
                      errors.position 
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                        : 'border-slate-300 dark:border-slate-800 focus:ring-emerald-500/25 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.position && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.position.message}</p>
                )}
              </div>

            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 transform active:scale-98"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Creating Admin Account...
              </>
            ) : (
              "Create Admin Account"
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <Link to="/" className="text-[11px] text-slate-400 dark:text-slate-500 hover:underline">
            Back to homepage
          </Link>
        </div>

      </div>
    </div>
  );
};
export default AdminInviteRegisterPage;
