import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GraduationCap, User, Phone, Mail, Lock, BookOpen, Layers, Landmark, Briefcase, FileText, Sun, Moon } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "donor", "admin"]),
  
  // Student specific
  matricNumber: z.string().optional(),
  faculty: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  
  // Donor specific
  donorType: z.enum(["individual", "corporate"]).optional(),
  organizationName: z.string().optional(),
  address: z.string().optional(),
  
  // Admin specific
  staffId: z.string().optional(),
  position: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'student') {
    if (!data.matricNumber || data.matricNumber.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Matric number is required", path: ["matricNumber"] });
    }
    if (!data.faculty || data.faculty.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Faculty is required", path: ["faculty"] });
    }
    if (!data.department || data.department.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Department is required", path: ["department"] });
    }
  }
  
  if (data.role === 'donor') {
    if (data.donorType === 'corporate' && (!data.organizationName || data.organizationName.trim() === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Organization name is required for corporate donors", path: ["organizationName"] });
    }
  }
  
  if (data.role === 'admin') {
    if (!data.staffId || data.staffId.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Staff ID is required", path: ["staffId"] });
    }
    if (!data.position || data.position.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Position is required", path: ["position"] });
    }
  }
});

export const RegisterPage = () => {
  const { register: authRegister, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "student",
      matricNumber: "",
      faculty: "",
      department: "",
      level: "100 Level",
      donorType: "individual",
      organizationName: "",
      address: "",
      staffId: "",
      position: ""
    }
  });

  const watchedRole = watch("role");
  const watchedDonorType = watch("donorType");

  React.useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'donor') navigate('/donor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    }
  }, [user]);

  const onSubmit = async (data) => {
    setError("");
    const payload = {
      full_name: data.fullName,
      email: data.email,
      phone_number: data.phoneNumber,
      password: data.password,
      role: data.role
    };

    if (data.role === "student") {
      payload.matric_number = data.matricNumber;
      payload.department = data.department;
      payload.faculty = data.faculty;
      payload.level = data.level;
    } else if (data.role === "donor") {
      payload.donor_type = data.donorType;
      payload.address = data.address;
      if (data.donorType === "corporate") {
        payload.organization_name = data.organizationName;
      }
    } else if (data.role === "admin") {
      payload.staff_id = data.staffId;
      payload.position = data.position;
    }

    setLoading(true);
    try {
      await authRegister(payload);
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 md:py-12 transition-colors duration-300 relative">
      {/* Theme toggle switch */}
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
          <Link to="/" className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/40 flex items-center justify-center transition-colors duration-300">
            <GraduationCap className="h-8 w-8" />
          </Link>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 transition-colors duration-300">Create Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">Sign up and join CampusAid today</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl text-center animate-fade-in transition-colors duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors duration-300">Select Profile Role</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'student', label: 'Student' },
                { id: 'donor', label: 'Donor' },
                { id: 'admin', label: 'Admin' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setValue("role", item.id)}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all transform active:scale-95 duration-200 ${
                    watchedRole === item.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-slate-100 dark:bg-slate-800 transition-colors duration-300" />

          {/* Section: General Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-widest transition-colors duration-300">Personal Details</h3>
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
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.fullName 
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                        : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
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
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.phoneNumber 
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                        : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
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
                    placeholder="you@domain.com"
                    {...register("email")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                        : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
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
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.password 
                        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                        : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.password.message}</p>
                )}
              </div>

            </div>
          </div>

          {/* Section: Student Specific Info */}
          {watchedRole === 'student' && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300 animate-slide-down">
              <h3 className="text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-widest">Academic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Matric Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="UG/20/CSC/1042"
                      {...register("matricNumber")}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.matricNumber 
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                          : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.matricNumber && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.matricNumber.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Faculty</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Landmark className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Faculty of Science"
                      {...register("faculty")}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.faculty 
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                          : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.faculty && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.faculty.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Department</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Computer Science"
                      {...register("department")}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.department 
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                          : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.department && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.department.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Level</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Layers className="h-4 w-4" />
                    </span>
                    <select
                      {...register("level")}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none dark:text-slate-100"
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

              </div>
            </div>
          )}

          {/* Section: Donor Specific Info */}
          {watchedRole === 'donor' && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300 animate-slide-down">
              <h3 className="text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-widest">Donor Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Donor Type</label>
                  <select
                    {...register("donorType")}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none dark:text-slate-100"
                  >
                    <option value="individual">Individual Contributor</option>
                    <option value="corporate">Corporate Organization</option>
                  </select>
                </div>

                {watchedDonorType === "corporate" && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Organization Name</label>
                    <input
                      type="text"
                      placeholder="Company Ltd"
                      {...register("organizationName")}
                      className={`w-full px-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.organizationName 
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                          : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
                      }`}
                    />
                    {errors.organizationName && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.organizationName.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Location/Address</label>
                  <input
                    type="text"
                    placeholder="Lagos, Nigeria"
                    {...register("address")}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950/40 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 dark:text-slate-100"
                  />
                </div>

              </div>
            </div>
          )}

          {/* Section: Admin Specific Info */}
          {watchedRole === 'admin' && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300 animate-slide-down">
              <h3 className="text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-widest">Administrator Credentials</h3>
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
                      className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.staffId 
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                          : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
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
                      className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950/40 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.position 
                          ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
                          : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.position && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.position.message}</p>
                  )}
                </div>

              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 transform active:scale-98"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Registering Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 transition-colors duration-300">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Log in
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
export default RegisterPage;
