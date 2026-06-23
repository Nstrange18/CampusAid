import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, Phone, Mail, Lock, BookOpen, Layers, Landmark, Briefcase, FileText } from 'lucide-react';

export const RegisterPage = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Common Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // student, donor, admin

  // Student Fields
  const [matricNumber, setMatricNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState("");
  const [level, setLevel] = useState("100 Level");

  // Donor Fields
  const [donorType, setDonorType] = useState("individual"); // individual, corporate
  const [organizationName, setOrganizationName] = useState("");
  const [address, setAddress] = useState("");

  // Admin Fields
  const [staffId, setStaffId] = useState("");
  const [position, setPosition] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'donor') navigate('/donor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate common fields
    if (!fullName || !email || !phoneNumber || !password) {
      setError("Please fill in all common details.");
      return;
    }

    const payload = {
      full_name: fullName,
      email: email,
      phone_number: phoneNumber,
      password: password,
      role: role
    };

    // Role-based validation and payload assignment
    if (role === "student") {
      if (!matricNumber || !department || !faculty || !level) {
        setError("Please fill in all student credentials.");
        return;
      }
      payload.matric_number = matricNumber;
      payload.department = department;
      payload.faculty = faculty;
      payload.level = level;
    } else if (role === "donor") {
      payload.donor_type = donorType;
      payload.address = address;
      if (donorType === "corporate") {
        if (!organizationName) {
          setError("Organization name is required for corporate donors.");
          return;
        }
        payload.organization_name = organizationName;
      }
    } else if (role === "admin") {
      if (!staffId || !position) {
        setError("Please fill in all administrator credentials.");
        return;
      }
      payload.staff_id = staffId;
      payload.position = position;
    }

    setLoading(true);
    try {
      await register(payload);
      // AuthContext handle immediate login and user redirection
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:py-12">
      <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-xl max-w-xl w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 flex items-center justify-center">
            <GraduationCap className="h-8 w-8" />
          </Link>
          <h2 className="text-2xl font-black tracking-tight text-slate-800">Create Account</h2>
          <p className="text-xs text-slate-500">Sign up and join CampusAid today</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">Select Profile Role</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'student', label: 'Student' },
                { id: 'donor', label: 'Donor' },
                { id: 'admin', label: 'Admin' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setRole(item.id)}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                    role === item.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-slate-100" />

          {/* Section: General Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-blue-700 uppercase tracking-widest">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-350 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
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
                    placeholder="+234..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-350 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-350 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-350 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Role Specific Info */}
          {role === 'student' && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-extrabold text-blue-700 uppercase tracking-widest">Academic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Matric Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="UG/20/CSC/1042"
                      value={matricNumber}
                      onChange={(e) => setMatricNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-350 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
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
                      placeholder="Faculty of Science"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-350 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
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
                      placeholder="Computer Science"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-350 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Level</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Layers className="h-4 w-4" />
                    </span>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-350 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
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
              </div>
            </div>
          )}

          {role === 'donor' && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-extrabold text-blue-700 uppercase tracking-widest">Donor Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Donor Type</label>
                  <select
                    value={donorType}
                    onChange={(e) => setDonorType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-355 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="individual">Individual Contributor</option>
                    <option value="corporate">Corporate Organization</option>
                  </select>
                </div>

                {donorType === "corporate" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Organization Name</label>
                    <input
                      type="text"
                      placeholder="Company Ltd"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-350 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
                      required={donorType === "corporate"}
                    />
                  </div>
                )}

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600">Location/Address</label>
                  <input
                    type="text"
                    placeholder="Lagos, Nigeria"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-350 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'admin' && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-extrabold text-blue-700 uppercase tracking-widest">Administrator Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Staff ID</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <FileText className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="STF/2026/001"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-355 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
                      required={role === 'admin'}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Position</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Dean of Students"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-350 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none"
                      required={role === 'admin'}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
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

        <div className="text-center pt-2 border-t border-slate-100 flex flex-col gap-2">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
          <Link to="/" className="text-[11px] text-slate-400 hover:underline">
            Back to homepage
          </Link>
        </div>

      </div>
    </div>
  );
};
export default RegisterPage;
