import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImg from '../../assets/loginImg.png';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import MongoDBStatus from './MongoDBStatus';

export const LoginBlade = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [serverStatus, setServerStatus] = useState(null); // null=unknown, true=online, false=offline
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading, isAuthenticated, user, error: contextError, isFirstLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mongoError, setMongoError] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('');

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Set error from context if available
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  // Check backend connectivity when component mounts
  useEffect(() => {
    checkServerStatus();
  }, []);

  // Check if the backend server is accessible
  const checkServerStatus = async () => {
    try {
      // Use a simple GET request to check if server is responding
      await axios.get('http://localhost:5555/api/health', { timeout: 3000 });
      setServerStatus(true);
    } catch (error) {
      console.error('Server health check failed:', error);
      setServerStatus(false);
    }
  };

  // Check backend health on mount
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        // Try to access the health endpoint
        const response = await axios.get('http://localhost:5555/api/health', { timeout: 4000 });
        
        // Check if MongoDB connection is reported as problematic
        if (response.data.mongodb.status !== 'connected') {
          setMongoError(true);
        } else {
          setMongoError(false);
        }
      } catch (error) {
        console.error('Server health check failed:', error);
        // Don't show mongo-specific error if the whole server is down
        setServerStatus(false);
      }
    };
    
    checkServerHealth();
  }, []);

  // Check for logout message
  useEffect(() => {
    const message = localStorage.getItem('logoutMessage');
    if (message) {
      setLogoutMessage(message);
      // Remove the message after showing it
      setTimeout(() => {
        localStorage.removeItem('logoutMessage');
      }, 100);
    }
  }, []);

  const handleChange = (e) => {
    // For email field, trim spaces as the user types
    if (e.target.name === 'email') {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value.trim()
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
    // Clear error on input change
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Get form data and normalize email
    let { email, password } = formData;
    
    // Normalize email (trim spaces and convert to lowercase)
    email = email.trim().toLowerCase();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsSubmitting(false);
      return;
    }

    // If server is already known to be offline, recheck before attempting login
    if (serverStatus === false) {
      await checkServerStatus();
      if (serverStatus === false) {
        setError('Server appears to be offline. Please try again later or contact support.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Count connection attempt
      setConnectionAttempts(prev => prev + 1);
      
      // Use the context's login function with normalized email
      const result = await login(email, password);
      
      if (result.success) {
        console.log('Login successful - redirecting to dashboard');
        // Clear any previous errors
        setError('');
        // Navigation will be handled by the useEffect, default view will be set in Master component
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
        
        // Check if this is a MongoDB-specific error
        if (result.message?.includes('database') || 
            result.message?.includes('MongoDB') || 
            result.code === 'MONGODB_UNAVAILABLE') {
          setMongoError(true);
        }
        
        // If this is a network error and we've tried multiple times, show additional help
        if ((result.message?.includes('Network Error') || result.message?.includes('connection')) && connectionAttempts > 1) {
          setError(prev => `${prev} This appears to be a persistent connection issue. Please check if the backend server is running.`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Check response for MongoDB error codes
      if (error.response?.data?.code === 'MONGODB_UNAVAILABLE') {
        setMongoError(true);
        setError('The database connection is currently unavailable. See details below.');
      } else if (error.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 px-4">
      <div className="p-8 max-w-md w-full bg-white shadow-xl rounded-xl border border-gray-100">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center bg-indigo-100 rounded-full shadow-inner h-16 w-16 overflow-hidden">
            <img 
              src={loginImg} 
              alt="Login" 
              className="h-14 w-14 object-cover"
            />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-800">Inquiry Dashboard</h1>
          <p className="mt-2 text-gray-500 text-center">
            Ceylon Beverage Can (Pvt) Ltd.
          </p>
        </div>

        {/* Logout Message */}
        {logoutMessage && (
          <div className="mb-6 p-3 bg-blue-100 text-blue-700 rounded-md">
            <p className="font-medium mb-1">Information</p>
            <p className="text-sm">{logoutMessage}</p>
          </div>
        )}

        {/* Server Status Alert */}
        {serverStatus === false && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
            <p className="font-medium mb-1">Server Connection Error</p>
            <p className="text-sm">Cannot connect to the server. Please check if the backend server is running.</p>
            <button 
              onClick={checkServerStatus}
              className="mt-2 text-sm bg-red-200 hover:bg-red-300 px-3 py-1 rounded-md transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Error message with enhanced styling */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
            <p className="font-medium mb-1">Error</p>
            <p className="text-sm">{error}</p>
            {(error.includes('Network Error') || error.includes('connection')) && (
              <div className="mt-2 text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
                <p className="font-medium text-yellow-800">Troubleshooting Tips:</p>
                <ul className="list-disc list-inside mt-1 text-yellow-700">
                  <li>Check if the backend server is running</li>
                  <li>Ensure MongoDB connection is working</li>
                  <li>Check your internet connection</li>
                  <li>Try using a different browser</li>
                  <li>Contact IT support if the issue persists</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* MongoDB Status when there are connection issues */}
        {mongoError && (
          <div className="mb-6">
            <MongoDBStatus />
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 border-gray-300 rounded-md"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 border-gray-300 rounded-md"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            forgot your password?{' '}
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Reset 
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};