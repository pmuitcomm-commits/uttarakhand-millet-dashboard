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
import AdminLanding from "./pages/AdminLanding";
import DistrictLanding from "./pages/DistrictLanding";
import BlockLanding from "./pages/BlockLanding";
import RegisterFarmer from "./pages/RegisterFarmer";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Footer from "./components/Footer";
import TopBar from "./components/TopBar";
import AboutPage from "./pages/aboutpage";
import { getPostLoginPath } from "./utils/authNavigation";

function ProtectedOfficerRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<AboutPage />} />
      <Route
        path="/login"
        element={
          loading ? (
            <div className="p-5 text-center">Loading...</div>
          ) : isAuthenticated ? (
            <Navigate to={getPostLoginPath(user?.role)} replace />
          ) : (
            <Login />
          )
        }
      />
      
      {/* Landing Pages - for officers */}
      <Route path="/admin-landing" element={
        <ProtectedOfficerRoute requiredRole="admin">
          <AdminLanding />
        </ProtectedOfficerRoute>
      } />
      <Route path="/district-landing" element={
        <ProtectedOfficerRoute requiredRole="district_officer">
          <DistrictLanding />
        </ProtectedOfficerRoute>
      } />
      <Route path="/block-landing" element={
        <ProtectedOfficerRoute requiredRole="block_officer">
          <BlockLanding />
        </ProtectedOfficerRoute>
      } />
      
      {/* Public Routes - for farmers */}
      <Route path="/enrollment-status" element={<CheckEnrollment />} />
      <Route path="/check-status" element={<CheckEnrollmentStatus />} />
      <Route path="/register-farmer" element={<RegisterFarmer />} />
      <Route path="/procurement" element={<Procurement />} />
      <Route path="/dashboard" element={<Dashboard page="dashboard" />} />
      <Route path="/production" element={<Dashboard page="production" />} />
      <Route path="/district" element={<Dashboard page="district" />} />
      <Route path="/millet" element={<Dashboard page="millet" />} />
      <Route path="/about-programme" element={<AboutPage />} />

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
      duration: 0,
      once: false,
      offset: 0,
      disable: false,
    });
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="m-0 flex h-screen w-full flex-col overflow-hidden bg-[#024b37] p-0 dark:bg-[#1a1a1a]">
          <TopBar />
          <main className="relative z-0 min-h-0 flex-1 overflow-auto">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
