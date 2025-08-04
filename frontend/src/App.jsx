// Frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/Auth/SignIn';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';

const ProtectedRoute = ({ children, roles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        setIsAuthenticated(false);
        return;
      }

      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg dark:bg-dark-primary-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tani-green-500"></div>
        <p className="ml-4 text-text-dark dark:text-text-light">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (roles && user) {
    const { isAdmin, isDeveloper } = user;

    if (roles.includes('admin') && isAdmin) return children;
    if (roles.includes('developer') && isDeveloper) return children;
    if (roles.includes('user') && !isAdmin && !isDeveloper) return children;

    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<SignIn />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['user']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/AdminDashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/DeveloperDashboard"
          element={
            <ProtectedRoute roles={['developer']}>
              <DeveloperDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
