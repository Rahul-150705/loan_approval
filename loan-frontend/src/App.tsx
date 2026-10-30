import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ApplicantDashboard from './pages/ApplicantDashboard';
import BankerDashboard from './pages/BankerDashboard';
import LoanApplyPage from './pages/LoanApplyPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: 'applicant' | 'banker' }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (user?.role === 'banker') return <Navigate to="/banker" replace />;
  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated() ? <DashboardRedirect /> : <Login />} />
        <Route path="/" element={<DashboardRedirect />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="applicant">
              <ApplicantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply"
          element={
            <ProtectedRoute role="applicant">
              <LoanApplyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/banker"
          element={
            <ProtectedRoute role="banker">
              <BankerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/banker/inbox"
          element={
            <ProtectedRoute role="banker">
              <BankerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick={true}
        theme="dark"
        toastClassName="rounded-none border border-[#1E2540] bg-[#0D1221] text-[#E8EEFF] shadow-2xl font-medium tracking-wide text-sm p-4"
      />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
