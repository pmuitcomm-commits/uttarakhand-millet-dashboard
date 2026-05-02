/**
 * App module - Defines the top-level route structure for the Millet MIS.
 *
 * The application wraps all pages with language and authentication providers,
 * renders persistent government header/footer UI, and separates public farmer
 * routes from protected officer dashboards.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Login from "./pages/Login";
import CheckEnrollment from "./pages/CheckEnrollment";
import Dashboard from "./pages/Dashboard";
import Procurement from "./pages/Procurement";
import AdminDashboard from "./pages/AdminDashboard";
import DistrictDashboard from "./pages/DistrictDashboard";
import BlockDashboard from "./pages/BlockDashboard";
import DataEntryPage from "./pages/DataEntryPage";
import MonitoringDetailPage from "./pages/MonitoringDetailPage";
import MonitoringOverviewPage from "./pages/MonitoringOverviewPage";
import RegisterFarmer from "./pages/RegisterFarmer";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Footer from "./components/Footer";
import TopBar from "./components/TopBar";
import AboutPage from "./pages/aboutpage";
import { getPostLoginPath } from "./utils/authNavigation";

/**
 * ProtectedOfficerRoute - Guards officer-only dashboard pages.
 *
 * This component checks the authenticated user context before rendering an
 * officer route. It redirects unauthenticated users to login and prevents users
 * from opening dashboards outside their assigned role.
 *
 * @component
 * @param {Object} props - Route guard properties.
 * @param {React.ReactNode} props.children - Protected page content.
 * @param {string|null} props.requiredRole - Required role for the page.
 * @param {string[]|null} props.allowedRoles - Allowed roles for shared pages.
 * @returns {React.ReactElement} Route guard result.
 */
function ProtectedOfficerRoute({ children, requiredRole = null, allowedRoles = null }) {
  const { isAuthenticated, user, loading } = useAuth();
  const roles = allowedRoles || (requiredRole ? [requiredRole] : null);

  if (loading) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function DistrictRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  if (isAuthenticated && user?.role === "district") {
    return <DistrictDashboard />;
  }

  return <Dashboard page="district" />;
}

function LegacyOfficerRedirect({ role, to }) {
  return (
    <ProtectedOfficerRoute requiredRole={role}>
      <Navigate to={to} replace />
    </ProtectedOfficerRoute>
  );
}

/**
 * AppRoutes - Registers all public and protected dashboard routes.
 *
 * Public farmer routes remain accessible without authentication, while admin,
 * district, and block dashboard routes are wrapped by role checks.
 *
 * @component
 * @returns {React.ReactElement} Application route tree.
 */
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
      
      {/* Public Routes - for farmers */}
      <Route path="/enrollment-status" element={<CheckEnrollment />} />
      <Route path="/register-farmer" element={<RegisterFarmer />} />
      <Route path="/procurement" element={<Procurement />} />
      <Route path="/dashboard" element={<Dashboard page="dashboard" />} />
      <Route path="/production" element={<Dashboard page="production" />} />
      <Route path="/district" element={<DistrictRoute />} />
      <Route path="/millet" element={<Dashboard page="millet" />} />
      <Route path="/about-programme" element={<AboutPage />} />

      {/* Protected Routes - for officers */}
      <Route path="/admin" element={
        <ProtectedOfficerRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedOfficerRoute>
      } />
      <Route path="/block" element={
        <ProtectedOfficerRoute requiredRole="block">
          <BlockDashboard />
        </ProtectedOfficerRoute>
      } />
      <Route path="/district/data" element={
        <ProtectedOfficerRoute allowedRoles={["admin", "district"]}>
          <DataEntryPage scopeType="district" />
        </ProtectedOfficerRoute>
      } />
      <Route path="/district/monitoring" element={
        <ProtectedOfficerRoute allowedRoles={["admin", "district"]}>
          <MonitoringOverviewPage level="district" />
        </ProtectedOfficerRoute>
      } />
      <Route path="/block/data" element={
        <ProtectedOfficerRoute allowedRoles={["admin", "block"]}>
          <DataEntryPage scopeType="block" />
        </ProtectedOfficerRoute>
      } />
      <Route path="/block/data/:sectionSlug" element={
        <ProtectedOfficerRoute allowedRoles={["admin", "block"]}>
          <DataEntryPage scopeType="block" />
        </ProtectedOfficerRoute>
      } />
      <Route path="/block/monitoring" element={
        <ProtectedOfficerRoute allowedRoles={["admin", "block"]}>
          <MonitoringOverviewPage level="block" />
        </ProtectedOfficerRoute>
      } />
      <Route path="/monitoring/:level/:tableName" element={
        <ProtectedOfficerRoute allowedRoles={["admin", "district", "block"]}>
          <MonitoringDetailPage />
        </ProtectedOfficerRoute>
      } />
      <Route path="/admin-dashboard" element={<LegacyOfficerRedirect role="admin" to="/admin" />} />
      <Route path="/admin-landing" element={<LegacyOfficerRedirect role="admin" to="/admin" />} />
      <Route path="/district-dashboard" element={
        <ProtectedOfficerRoute requiredRole="district">
          <Navigate to="/district" replace />
        </ProtectedOfficerRoute>
      } />
      <Route path="/district-landing" element={<LegacyOfficerRedirect role="district" to="/district" />} />
      <Route path="/block-dashboard" element={<LegacyOfficerRedirect role="block" to="/block" />} />
      <Route path="/block-landing" element={<LegacyOfficerRedirect role="block" to="/block" />} />
    </Routes>
  );
}

/**
 * App - Root React component for the Millet MIS frontend.
 *
 * The component initializes page animation behavior and composes global
 * providers required by authentication, localization, and routing.
 *
 * @component
 * @returns {React.ReactElement} Complete MIS application shell.
 */
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
        {/* Full-height Tailwind shell keeps the header/footer fixed while page content scrolls responsively. */}
        <div className="m-0 flex h-screen h-dvh w-full flex-col overflow-hidden bg-[#024b37] p-0 dark:bg-[#1a1a1a]">
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
