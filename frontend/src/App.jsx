import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Core pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

// Student pages
import StudentDashboard from './pages/StudentDashboard';
import RequestForm from './pages/RequestForm';
import UploadDocs from './pages/UploadDocs';
import RequestStatus from './pages/RequestStatus';

// Donor pages
import DonorDashboard from './pages/DonorDashboard';
import CampaignListing from './pages/CampaignListing';
import CampaignDetails from './pages/CampaignDetails';
import UploadDonationProof from './pages/UploadDonationProof';
import DonationHistory from './pages/DonationHistory';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminRequestsList from './pages/AdminRequestsList';
import AdminRequestReview from './pages/AdminRequestReview';
import AdminChecklist from './pages/AdminChecklist';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminDonations from './pages/AdminDonations';
import AdminReports from './pages/AdminReports';
import AdminUsers from './pages/AdminUsers';

// Page loader
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
    <div className="text-center space-y-3">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Initializing CampusAid Secure Portal...</p>
    </div>
  </div>
);

// Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized, send to landing
    return <Navigate to="/" replace />;
  }

  return children;
};

// Route wrapper that injects the DashboardLayout around children
const DashboardRoute = ({ children, allowedRoles }) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected General Pages (Admin, Student & Donor can view) */}
          <Route path="/profile" element={
            <DashboardRoute>
              <ProfilePage />
            </DashboardRoute>
          } />
          <Route path="/notifications" element={
            <DashboardRoute>
              <NotificationsPage />
            </DashboardRoute>
          } />

          {/* Student Protected Portal */}
          <Route path="/student/dashboard" element={
            <DashboardRoute allowedRoles={['student']}>
              <StudentDashboard />
            </DashboardRoute>
          } />
          <Route path="/student/requests/new" element={
            <DashboardRoute allowedRoles={['student']}>
              <RequestForm />
            </DashboardRoute>
          } />
          <Route path="/student/requests/:id/upload" element={
            <DashboardRoute allowedRoles={['student']}>
              <UploadDocs />
            </DashboardRoute>
          } />
          <Route path="/student/requests/:id/status" element={
            <DashboardRoute allowedRoles={['student']}>
              <RequestStatus />
            </DashboardRoute>
          } />

          {/* Donor Protected Portal */}
          <Route path="/donor/dashboard" element={
            <DashboardRoute allowedRoles={['donor']}>
              <DonorDashboard />
            </DashboardRoute>
          } />
          <Route path="/campaigns" element={
            <DashboardRoute allowedRoles={['donor']}>
              <CampaignListing />
            </DashboardRoute>
          } />
          <Route path="/campaigns/:id" element={
            <DashboardRoute allowedRoles={['donor']}>
              <CampaignDetails />
            </DashboardRoute>
          } />
          <Route path="/donor/donations/:id/upload-proof" element={
            <DashboardRoute allowedRoles={['donor']}>
              <UploadDonationProof />
            </DashboardRoute>
          } />
          <Route path="/donor/history" element={
            <DashboardRoute allowedRoles={['donor']}>
              <DonationHistory />
            </DashboardRoute>
          } />

          {/* Admin Protected Portal */}
          <Route path="/admin/dashboard" element={
            <DashboardRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </DashboardRoute>
          } />
          <Route path="/admin/requests" element={
            <DashboardRoute allowedRoles={['admin']}>
              <AdminRequestsList />
            </DashboardRoute>
          } />
          <Route path="/admin/requests/:id/review" element={
            <DashboardRoute allowedRoles={['admin']}>
              <AdminRequestReview />
            </DashboardRoute>
          } />
          <Route path="/admin/requests/:id/checklist" element={
            <DashboardRoute allowedRoles={['admin']}>
              <AdminChecklist />
            </DashboardRoute>
          } />
          <Route path="/admin/campaigns" element={
            <DashboardRoute allowedRoles={['admin']}>
              <AdminCampaigns />
            </DashboardRoute>
          } />
          <Route path="/admin/donations" element={
            <DashboardRoute allowedRoles={['admin']}>
              <AdminDonations />
            </DashboardRoute>
          } />
          <Route path="/admin/reports" element={
            <DashboardRoute allowedRoles={['admin']}>
              <AdminReports />
            </DashboardRoute>
          } />
          <Route path="/admin/users" element={
            <DashboardRoute allowedRoles={['admin']}>
              <AdminUsers />
            </DashboardRoute>
          } />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
};
export default App;
