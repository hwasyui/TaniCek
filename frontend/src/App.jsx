import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/Auth/SignIn';
import Signup from './pages/Auth/SignUp';
import Dashboard from './pages/Dashboard';
import { checkAuthStatus } from './api';

// A component to protect routes, checks if user is authenticated
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null means loading, true/false for authenticated state

  useEffect(() => {
    const verifyAuth = async () => {
      // --- AUTH CHECK: Call your Express backend to verify authentication ---
      // This function in src/api.js would make an API call to your backend
      // and typically receive a response like { isAuthenticated: true, user: { ... } }
      // const authResponse = await checkAuthStatus();
      // setIsAuthenticated(authResponse.isAuthenticated);

      // --- SIMULATE AUTHENTICATION FOR DEVELOPMENT ---
      // For development, we'll assume the user is authenticated after a short delay
      // In a real app, this would be based on actual backend session/token validation
      setTimeout(() => {
        setIsAuthenticated(true); // Simulate authenticated
      }, 500);
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <p className="ml-4 text-text-dark">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login"/>
};


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* You'll add more protected routes as you build out */}
        {/* <Route
          path="/activity-history"
          element={
            <ProtectedRoute>
              <ActivityHistory />
            </ProtectedRoute>
          }
        /> */}

        {/* Default route to redirect to dashboard if authenticated, or login otherwise */}
        {/* Note: This assumes your ProtectedRoute handles the initial auth check */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;