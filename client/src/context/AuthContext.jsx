import React, { createContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import EventSourceWithAuth from '../utils/EventSourceWithAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const eventSourceRef = useRef(null);
  
  // Define logout function FIRST to avoid the "Cannot access before initialization" error
  const logout = useCallback((message = null, redirect = '/login') => {
    console.log('Logging out user:', message);
    
    // Clean up SSE connection
    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
      } catch (err) {
        console.warn('Error closing SSE connection:', err);
      } finally {
        eventSourceRef.current = null;
      }
    }
    
    // Clear auth data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('profileVersion');
    localStorage.setItem('loggedOut', 'true');
    
    // Remove auth headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Store logout message if provided
    if (message) {
      localStorage.setItem('logoutMessage', message);
    }
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
    
    // Force a full page reload to clear all React state
    if (redirect) {
      window.location.href = redirect;
    }
  }, []);

  // Now setup notifications using the already defined logout function
  const setupNotifications = useCallback(() => {
    if (!isAuthenticated || !user || !user._id) return;
    
    // Skip if we already have an active connection
    if (eventSourceRef.current && eventSourceRef.current.isConnected) {
      console.log('SSE connection already exists, skipping setup');
      return;
    }
    
    // Clean up any existing connection
    if (eventSourceRef.current) {
      console.log('Closing existing SSE connection before creating new one');
      try {
        eventSourceRef.current.close();
      } catch (err) {
        console.warn('Error closing existing SSE connection:', err);
      } finally {
        eventSourceRef.current = null;
      }
    }
    
    try {
      console.log('Setting up SSE notifications for user:', user._id);
      
      // Create new EventSourceWithAuth instance with improved options
      const es = new EventSourceWithAuth('http://localhost:5555/user/notifications', {
        debug: true,
        timeoutDuration: 30000, // Increase timeout to 30 seconds
        maxReconnectAttempts: 5,  // Increase reconnect attempts
        reconnectInterval: 5000   // Longer interval between reconnects
      });
      
      // Set up message handler
      es.onmessage = (event) => {
        try {
          // Make sure we have valid data
          const data = event.data || {};
          console.log('Received SSE notification:', data);
          
          // Handle force logout notification
          if (data.type === 'forceLogout') {
            console.log('Force logout notification received:', data.message);
            
            // Add a small delay before logout to ensure the message is displayed
            setTimeout(() => {
              logout(data.message || 'Your account has been updated by an administrator. Please log in again.');
            }, 500);
          }
        } catch (err) {
          console.error('Error handling SSE message:', err);
        }
      };
      
      // Handle connection open
      es.addEventListener('open', () => {
        console.log('SSE connection established successfully');
      });
      
      // Handle errors
      es.onerror = (event) => {
        console.error('SSE connection error:', event);
      };
      
      // Store the EventSource reference
      eventSourceRef.current = es;
    } catch (err) {
      console.error('Error setting up SSE notifications:', err);
    }
  }, [isAuthenticated, user, logout]);
  
  // Set up axios interceptor for token handling
  useEffect(() => {
    const setupAxiosInterceptor = () => {
      axios.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );
      
      // Add a response interceptor to handle 401 errors
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          console.log("API error response:", error);
          // If 401 error on a protected route when we think we're authenticated, logout
          if (error.response && error.response.status === 401 && isAuthenticated) {
            console.log("Received 401 while authenticated - logging out");
            logout("Your session has expired. Please log in again.");
          }
          return Promise.reject(error);
        }
      );
    };
    
    setupAxiosInterceptor();
  }, [isAuthenticated, logout]);
  
  // Set up notifications whenever auth state changes
  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      setupNotifications();
    }
    
    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        console.log('Closing SSE connection on unmount');
        try {
          eventSourceRef.current.close();
        } catch (err) {
          console.warn('Error closing SSE connection on unmount:', err);
        } finally {
          eventSourceRef.current = null;
        }
      }
    };
  }, [setupNotifications, isAuthenticated, user]);
  
  // Setup a helper function to manually check for profile changes
  const startSSEConnection = useCallback(() => {
    if (isAuthenticated && user && user._id) {
      setupNotifications();
    }
  }, [isAuthenticated, user, setupNotifications]);
  
  // Check for stored user on mount
  useEffect(() => {
    // Check for user data in localStorage on mount
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const localProfileVersion = localStorage.getItem('profileVersion');
        const justLoggedOut = localStorage.getItem('justLoggedOut');
        
        // Skip profile check if user just logged out with profile update message
        if (justLoggedOut === 'true') {
          localStorage.removeItem('justLoggedOut');
          setLoading(false);
          return;
        }
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          
          // Verify token is valid by making a profile request
          try {
            const config = {
              headers: {
                Authorization: `Bearer ${token}`
              }
            };
            
            const res = await axios.get('http://localhost:5555/user/profile', config);
            
            // Check if profile version has changed - if so, force logout
            const serverProfileVersion = res.data.profileVersion || 0;
            const storedVersion = localProfileVersion ? parseInt(localProfileVersion) : 0;
            
            if (serverProfileVersion > storedVersion) {
              console.log('Profile has been updated since last login, forcing logout');
              logout('Your account information has been updated. Please log in again.');
              // Set a flag that we just logged out due to profile update
              localStorage.setItem('justLoggedOut', 'true');
              return;
            }
            
            // If profile is still valid, update user data
            setUser({
              ...userData,
              ...res.data, // This ensures we have the latest data including permissions
            });
            
            // Store the latest profile version
            localStorage.setItem('profileVersion', serverProfileVersion.toString());
            setIsAuthenticated(true);
          } catch (err) {
            console.error('Error verifying token:', err.response?.data?.message || err.message);
            // Only logout if we have a 401 Unauthorized or other clear auth failure
            // (Network errors shouldn't automatically logout the user)
            if (err.response && [401, 403].includes(err.response.status)) {
              logout("Your session has expired. Please log in again.");
            } else {
              // For other errors, we'll consider the user authenticated based on local storage
              // but will update the UI to reflect the error status
              setUser(userData);
              setIsAuthenticated(true);
              setError("Couldn't refresh your profile. Some features may be limited.");
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading user from localStorage', err);
        setLoading(false);
      }
    };
    
    loadUser();
  }, [logout]);
  
  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear any previous profile update flags
      localStorage.removeItem('justLoggedOut');
      
      const res = await axios.post('http://localhost:5555/user/login', {
        email,
        password
      });
      
      if (!res.data || !res.data.token) {
        throw new Error('Invalid response from server - missing token');
      }
      
      // Ensure permissions are properly formatted
      const userData = {
        ...res.data,
        permissions: res.data.permissions || [] // Ensure permissions is an array
      };
      
      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', res.data.token);
      localStorage.removeItem('loggedOut');
      
      // Store profile version to track changes
      if (res.data.profileVersion) {
        localStorage.setItem('profileVersion', res.data.profileVersion.toString());
      } else {
        localStorage.setItem('profileVersion', "1"); // Default if not provided
      }
      
      // Set first login flag to trigger initial data load
      setIsFirstLogin(true);
      
      // Set user context with ensured permissions
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('User logged in, permissions:', userData.permissions);
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      console.error('Login error:', err);
      
      const message = err.response?.data?.message || 'Login failed. Please check your credentials or try again later.';
      setError(message);
      return { success: false, message };
    }
  };
  
  // Enhanced security check function that uses the updated logout
  const checkSecurityChanges = useCallback(async () => {
    if (!user || !user._id) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const localProfileVersion = localStorage.getItem('profileVersion');
      if (!localProfileVersion) return;
      
      const res = await axios.get('http://localhost:5555/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const serverProfileVersion = res.data.profileVersion || 0;
      const storedVersion = parseInt(localProfileVersion);
      
      if (serverProfileVersion > storedVersion) {
        console.log('Profile has been updated since last login, forcing logout');
        logout('Your account information has been updated. Please log in again.');
      }
    } catch (err) {
      console.error('Error checking security changes:', err);
    }
  }, [user, logout]);
  
  // Replace the permission check function with a more efficient version
  const checkPermission = useCallback((permission) => {
    if (!user) return false;
    
    // Only log in development environment and with a DEBUG flag
    const shouldLog = process.env.NODE_ENV === 'development' && localStorage.getItem('DEBUG_PERMISSIONS') === 'true';
    
    // Check if the user has the required permission
    const hasPermission = user.role?.permissions?.includes(permission) || 
                          user.role?.name === 'admin' || 
                          false;
    
    if (shouldLog) {
      console.log('Permission check for:', permission, 'user:', user);
    }
    
    return hasPermission;
  }, [user]);
  
  // Define isAdmin based on the user's actual access level - add more debugging
  const isAdmin = useMemo(() => {
    console.log('Checking admin status for user:', user);
    if (!user) return false;
    
    // Log the accessLevel to debug
    console.log('User accessLevel:', user.accessLevel);
    const adminStatus = user.accessLevel === 'admin';
    
    // Add explicit property to user object to ensure it's accessible
    if (user && !user.hasOwnProperty('isAdmin')) {
      user.isAdmin = adminStatus;
    }
    
    return adminStatus;
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      isFirstLogin,
      setIsFirstLogin,
      login,
      logout,
      checkSecurityChanges,
      startSSEConnection,
      setupNotifications,
      checkPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
