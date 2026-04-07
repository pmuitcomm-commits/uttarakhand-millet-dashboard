import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Login from "./pages/Login";
import CheckEnrollment from "./pages/CheckEnrollment";
import CheckEnrollmentStatus from "./pages/CheckEnrollmentStatus";
import Dashboard from "./pages/Dashboard";
import Procurement from "./pages/Procurement";
import AdminDashboard from "./pages/AdminDashboard";
import DistrictDashboard from "./pages/DistrictDashboard";
import BlockDashboard from "./pages/BlockDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

function ProtectedOfficerRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/procurement" replace /> : <Login />
      } />
      
      {/* Public Routes - for farmers */}
      <Route path="/enrollment-status" element={<CheckEnrollment />} />
      <Route path="/check-status" element={<CheckEnrollmentStatus />} />
      <Route path="/procurement" element={<Procurement />} />
      <Route path="/dashboard" element={<Dashboard page="dashboard" />} />
      <Route path="/production" element={<Dashboard page="production" />} />
      <Route path="/district" element={<Dashboard page="district" />} />
      <Route path="/millet" element={<Dashboard page="millet" />} />

      {/* Protected Routes - for officers */}
      <Route path="/admin-dashboard" element={
        <ProtectedOfficerRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedOfficerRoute>
      } />
      <Route path="/district-dashboard" element={
        <ProtectedOfficerRoute requiredRole="district_officer">
          <DistrictDashboard />
        </ProtectedOfficerRoute>
      } />
      <Route path="/block-dashboard" element={
        <ProtectedOfficerRoute requiredRole="block_officer">
          <BlockDashboard />
        </ProtectedOfficerRoute>
      } />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <div style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0, backgroundColor: '#024b37', overflow: 'auto' }}>
          <AppRoutes />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;