import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios defaults for better SSL handling
  useEffect(() => {
    // Set a longer timeout for SSL handshakes
    axios.defaults.timeout = 15000;
    
    // Add additional headers that might help with certain proxy/SSL issues
    axios.defaults.headers.common['Cache-Control'] = 'no-cache';
    axios.defaults.headers.common['Pragma'] = 'no-cache';
    
    // Check for existing auth token
    const userFromStorage = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userFromStorage && token) {
      try {
        const parsedUser = JSON.parse(userFromStorage);
        
        // Setup axios defaults with the token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  // Login user with improved MongoDB error handling
  const login = async (email, password, retryCount = 2) => {
    setLoading(true);
    setError(null);
    
    let attempts = 0;
    let lastError = null;
    
    while (attempts < retryCount) {
      try {
        console.log(`Login attempt ${attempts + 1}/${retryCount}`);
        
        // First check MongoDB connection status
        try {
          const healthCheck = await axios.get('http://localhost:5555/api/mongodb/status', { timeout: 2000 });
          
          // If MongoDB is not connected, don't even try to login
          if (healthCheck.data.status !== 'connected' && healthCheck.data.status !== 'connecting') {
            setLoading(false);
            return {
              success: false,
              code: 'MONGODB_UNAVAILABLE',
              message: 'Database connection is unavailable. Please check the connection status below.'
            };
          }
        } catch (healthError) {
          // Continue with login attempt even if health check fails
          console.log('Health check failed, continuing with login attempt:', healthError);
        }
        
        // Proceed with login attempt
        const response = await axios.post('http://localhost:5555/user/login', {
          email,
          password
        }, {
          // Additional options to help with connection issues
          timeout: 10000, // 10 seconds
          retryTimeout: 1000,
          maxRedirects: 0
        });

        const userData = response.data;
        
        // User status check and token handling as before
        if (userData && userData.status === 'inactive') {
          setLoading(false);
          return {
            success: false,
            message: 'Your account is inactive. Please contact the administrator.'
          };
        }
        
        if (userData.token) {
          localStorage.setItem('token', userData.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.removeItem('loggedOut');
          
          setUser(userData);
          setLoading(false);
          return { success: true, user: userData };
        } else {
          console.error('No token received from login response');
          setLoading(false);
          return {
            success: false,
            message: 'Authentication failed. Please try again.'
          };
        }
      } catch (error) {
        console.error(`Login error (attempt ${attempts + 1}):`, error);
        lastError = error;
        attempts++;
        
        // Check specifically for MongoDB errors
        if (error.response?.data?.code === 'MONGODB_UNAVAILABLE') {
          break; // Don't retry if the database is explicitly unavailable
        }
        
        // If this isn't a network error or we've exceeded retries, don't try again
        if (!error.message?.includes('Network Error') || attempts >= retryCount) {
          break;
        }
        
        // Wait a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    // Handle different types of errors after all retries failed
    let errorMessage = 'An error occurred during login';
    let errorCode = null;
    
    if (lastError) {
      if (lastError.response?.data?.code === 'MONGODB_UNAVAILABLE') {
        errorMessage = 'Database connection is currently unavailable. Please try again later.';
        errorCode = 'MONGODB_UNAVAILABLE';
      } else if (lastError.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please try again.';
      } else if (lastError.message && lastError.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check if the backend server is running.';
      } else if (lastError.message && lastError.message.includes('SSL')) {
        errorMessage = 'Secure connection error. Please contact IT support.';
      } else if (lastError.response) {
        // Server responded with an error status
        if (lastError.response.data?.code === 'MONGODB_UNAVAILABLE') {
          errorMessage = 'The database is currently unavailable. Please try again later.';
        } else {
          errorMessage = lastError.response.data?.message || 'Server error. Please try again.';
        }
      }
    }
    
    setError(errorMessage);
    setLoading(false);
    
    return {
      success: false,
      code: errorCode,
      message: errorMessage
    };
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    localStorage.setItem('loggedOut', Date.now().toString());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.accessLevel === 'Administrator'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
