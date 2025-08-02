// Frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/Auth/SignIn';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      // --- AUTH CHECK: Call your Express backend to verify authentication ---
      // This function in src/api.js would make an API call to your backend
      // and typically receive a response like { isAuthenticated: true, user: { ... } }
      // const authResponse = await checkAuthStatus();
      // setIsAuthenticated(authResponse.isAuthenticated);

      setTimeout(() => {
        setIsAuthenticated(true);
      }, 500);
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg dark:bg-dark-primary-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tani-green-500"></div> {/* Use tani-green-500 */}
        <p className="ml-4 text-text-dark dark:text-text-light">Loading...</p> {/* Use text-dark/light */}
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
