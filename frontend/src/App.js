import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Login from "./pages/Login";
import CheckEnrollment from "./pages/CheckEnrollment";
import CheckEnrollmentStatus from "./pages/CheckEnrollmentStatus";
import Dashboard from "./pages/Dashboard";
import Procurement from "./pages/Procurement";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    return loggedIn ? children : <Navigate to="/" replace />;
  };

  return (
    <LanguageProvider>
      <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, backgroundColor: '#024b37', overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/enrollment-status" element={<CheckEnrollment />} />
          <Route path="/check-status" element={<CheckEnrollmentStatus />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard page="dashboard" />
            </ProtectedRoute>
          } />
          <Route path="/procurement" element={
            <ProtectedRoute>
              <Procurement />
            </ProtectedRoute>
          } />
          <Route path="/production" element={
            <ProtectedRoute>
              <Dashboard page="production" />
            </ProtectedRoute>
          } />
          <Route path="/district" element={
            <ProtectedRoute>
            <Dashboard page="district" />
          </ProtectedRoute>
        } />
        <Route path="/millet" element={
          <ProtectedRoute>
            <Dashboard page="millet" />
          </ProtectedRoute>
        } />
      </Routes>
      </div>
    </LanguageProvider>
  );
}

export default App;