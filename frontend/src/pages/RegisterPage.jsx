import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GraduationCap, User, Phone, Mail, Lock, BookOpen, Layers, Landmark, Sun, Moon, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { BrandMark } from '../components/BrandMark';

// ── Faculty → Departments mapping ──────────────────────────────────────────────
const FACULTY_DEPARTMENTS = {
  "Faculty of Agriculture": [
    "Agricultural Economics",
    "Agricultural Extension",
    "Animal Science",
    "Soil Science",
    "Nutrition & Dietetics",
    "Home Science & Management",
    "Food Science and Technology",
    "Crop Science",
  ],
  "Faculty of Health Sciences": [
    "Department of Health Sciences",
  ],
  "Faculty of Law": [
    "International & Comparative Law",
    "Commercial & Corporate Law",
    "Customary & Indigenous Law",
    "Jurisprudence & Legal Theory",
    "Property Law",
    "Public Law",
    "Private Law",
  ],
  "Faculty of Arts": [
    "History & International Studies",
    "Mass Communication",
    "Archaeology & Tourism",
    "English & Literary Studies",
    "Fine & Applied Arts",
    "Linguistics, Igbo & other Nigerian Languages",
    "Music",
    "Theatre & Film Studies",
    "Foreign Language & Literature",
  ],
  "Faculty of Biomedical Sciences": [
    "Department of Biomedical Sciences",
  ],
  "Faculty of Medical Sciences": [
    "Department of Medical Sciences",
  ],
  "Faculty of Biological Sciences": [
    "Biochemistry",
    "Microbiology",
    "Plant Science & Biotechnology",
    "Genetics & Biotechnology",
    "Zoology & Environmental Biology",
  ],
  "Faculty of Pharmaceutical Sciences": [
    "Pharmaceutical & Medicinal Chemistry",
    "Pharmacology & Toxicology",
    "Pharmaceutics",
    "Pharmaceutical Technology & Industrial Pharmacy",
    "Pharmacognosy & Environmental Medicines",
    "Clinical Pharmacy & Pharmacy Management",
    "Pharmaceutical Microbiology & Biotechnology",
  ],
  "Faculty of Business Administration": [
    "Accountancy",
    "Marketing",
    "Banking & Finance",
    "Management",
  ],
  "Faculty of Social Sciences": [
    "Public Administration & Local Government",
    "Economics",
    "Political Science",
    "Social Work",
    "Religion & Cultural Studies",
    "Psychology",
    "Philosophy",
    "Geography",
    "Sociology & Anthropology",
  ],
  "Faculty of Dentistry": [
    "Department of Dentistry",
  ],
  "Faculty of Physical Sciences": [
    "Pure & Industrial Chemistry",
    "Computer Science",
    "Geology",
    "Mathematics",
    "Physics & Astronomy",
    "Science Laboratory Technology",
    "Statistics",
  ],
  "Faculty of Education": [
    "Adult Education",
    "Arts Education",
    "Computer Education",
    "Educational Foundations",
    "Library Science",
    "Human Kinetics & Health Education",
    "Science Education",
    "Social Science",
  ],
  "Faculty of Veterinary Medicine": [
    "Veterinary Pathology & Microbiology",
    "Veterinary Obstetrics & Reproductive Diseases",
    "Veterinary Physiology & Pharmacology",
    "Veterinary Anatomy",
    "Veterinary Medicine",
    "Veterinary Animal Health & Production",
    "Veterinary Parasitology & Entomology",
    "Veterinary Public Health & Preventive Medicine",
    "Veterinary Surgery",
    "Veterinary Teaching Hospital",
  ],
  "Faculty of Engineering": [
    "Agric. & Bioresources Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Electronic Engineering",
    "Mechanical Engineering",
    "Metallurgical & Materials Engineering",
    "Mechatronic Engineering",
    "BioMedical Engineering",
  ],
  "Faculty of Vocational Technical Education": [
    "Agricultural Education",
    "Business Education",
    "Computer Education",
    "Industrial Technical Education",
    "Home Economics & Hospitality Management Education",
    "Computer and Robotics",
  ],
  "Faculty of Environmental Studies": [
    "Estate Management",
    "Architecture",
    "Urban & Regional Planning",
    "Geoinformatics & Surveying",
  ],
};

const FACULTY_NAMES = Object.keys(FACULTY_DEPARTMENTS);

// ── Validation schema ──────────────────────────────────────────────────────────
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "donor"]),
  
  // Student specific
  matricNumber: z.string().optional(),
  faculty: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  
  // Donor specific
  donorType: z.enum(["individual", "corporate"]).optional(),
  organizationName: z.string().optional(),
  address: z.string().optional(),
  
  // Admin specific fields removed — admin registration is invite-only
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
      address: ""
    }
  });

  const watchedRole = watch("role");
  const watchedDonorType = watch("donorType");
  const watchedFaculty = watch("faculty");

  // Derive available departments from the selected faculty
  const availableDepartments = watchedFaculty ? (FACULTY_DEPARTMENTS[watchedFaculty] || []) : [];

  React.useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'donor') navigate('/donor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    }
  }, [user]);

  // Reset department when faculty changes
  const handleFacultyChange = (e) => {
    const newFaculty = e.target.value;
    setValue("faculty", newFaculty, { shouldValidate: true });
    setValue("department", "", { shouldValidate: false });
  };

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
    }

    setLoading(true);
    try {
      await authRegister(payload);
      toast.success("Account created successfully! Welcome to CampusAid.");
    } catch (err) {
      const errorMsg = err.message || "Registration failed. Try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Shared select styling helper
  const selectClassName = (hasError) =>
    `w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:ring-2 focus:outline-none appearance-none transition-all ${
      hasError
        ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
        : 'border-slate-300 dark:border-slate-800 focus:ring-blue-500/25 focus:border-blue-500'
    } dark:text-slate-100`;

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
          <Link to="/" className="rounded-2xl transition-transform duration-300 hover:scale-105" aria-label="Back to CampusAid home">
            <BrandMark className="h-14 w-14 rounded-2xl" iconClassName="h-9 w-9" />
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
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'student', label: 'Student' },
                { id: 'donor', label: 'Donor' }
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
                      placeholder="20XX/012345"
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

                {/* ── Faculty dropdown ── */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Faculty</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Landmark className="h-4 w-4" />
                    </span>
                    <select
                      {...register("faculty")}
                      onChange={handleFacultyChange}
                      className={selectClassName(errors.faculty)}
                    >
                      <option value="">— Select Faculty —</option>
                      {FACULTY_NAMES.map((fac) => (
                        <option key={fac} value={fac}>{fac}</option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </div>
                  {errors.faculty && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 animate-fade-in">{errors.faculty.message}</p>
                  )}
                </div>

                {/* ── Department dropdown (filtered by faculty) ── */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Department</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <select
                      {...register("department")}
                      disabled={!watchedFaculty}
                      className={`${selectClassName(errors.department)} ${!watchedFaculty ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">
                        {watchedFaculty ? "— Select Department —" : "— Choose a faculty first —"}
                      </option>
                      {availableDepartments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown className="h-4 w-4" />
                    </span>
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

