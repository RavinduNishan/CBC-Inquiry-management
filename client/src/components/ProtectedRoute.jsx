import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * Protected Route component
 * Redirects unauthenticated users to the login page
 * Allows authenticated users to access the protected route
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();
  const [localLoading, setLocalLoading] = useState(true);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  
  // Add debug logging to identify auth state issues
  useEffect(() => {
    const hasToken = localStorage.getItem('token');
    console.log('ProtectedRoute auth check:', { 
      isAuthenticated, 
      loading,
      hasToken,
      path: location.pathname
    });
  }, [isAuthenticated, loading, location]);
  
  // Use an effect to stabilize the redirect decision
  useEffect(() => {
    // Check if we have a token in localStorage as fallback
    const hasToken = localStorage.getItem('token');
    
    if (!loading && !isAuthenticated && !hasToken) {
      console.log('Setting redirect flag - no auth detected');
      // Wait a moment to ensure this isn't a temporary state
      const timer = setTimeout(() => {
        setRedirectToLogin(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (isAuthenticated || hasToken) {
      setLocalLoading(false);
      setRedirectToLogin(false);
    }
  }, [isAuthenticated, loading]);
  
  // If globally loading or locally loading, show spinner
  if (loading || (localLoading && !redirectToLogin)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 max-w-sm mx-auto bg-white rounded-xl shadow-md">
          <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-500 mt-3">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  // If we've decided to redirect, do so
  if (redirectToLogin) {
    console.log('Redirecting to login, no valid auth found');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Otherwise render children
  return children;
};

export default ProtectedRoute;
