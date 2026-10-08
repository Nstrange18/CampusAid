import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { toast } from 'react-toastify';
import { BrandMark } from '../components/BrandMark';

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const LoginPage = () => {
  const { login, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (role) => {
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'donor') navigate('/donor/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      const profile = await login(data.email, data.password);
      toast.success("Login successful! Welcome back.");
      redirectUser(profile.role);
    } catch (err) {
      const errorMsg = err.message || "Invalid credentials. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300 relative">
      {/* Theme toggle switch */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 transition-all transform active:scale-95 duration-300"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl/40 max-w-md w-full space-y-6 transition-all duration-300 hover:shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="rounded-2xl transition-transform duration-300 hover:scale-105" aria-label="Back to CampusAid home">
            <BrandMark className="h-14 w-14 rounded-2xl" iconClassName="h-9 w-9" />
          </Link>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 transition-colors duration-300">Welcome Back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">Sign in to access your CampusAid account</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl text-center animate-fade-in transition-colors duration-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors duration-300">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="you@school.edu"
                {...register("email")}
                className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-500 dark:text-slate-100'
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
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.password 
                    ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                    : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500 dark:focus:border-blue-500 dark:text-slate-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 transform active:scale-98"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Info */}
        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 transition-colors duration-300">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Create an account
            </Link>
          </p>
          <Link to="/" className="text-[11px] text-slate-400 dark:text-slate-500 hover:underline">
            Back to homepage
          </Link>
        </div>

      </div>
    </div>
  );
};
export default LoginPage;
