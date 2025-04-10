import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in when app loads
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      setUser(JSON.parse(userFromStorage));
    }
    setLoading(false);
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5555/user/login', {
        email,
        password
      });

      // Store user in state and localStorage
      const userData = response.data;
      
      // Check for inactive status before storing user data
      if (userData && userData.status === 'inactive') {
        return {
          success: false,
          message: 'Your account is inactive. Please contact the administrator.'
        };
      }
      
      // Store token separately for easier access
      if (userData.token) {
        localStorage.setItem('token', userData.token);
        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      }
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred during login'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Remove the Authorization header from axios
    delete axios.defaults.headers.common['Authorization'];
    
    // Set a logout flag with timestamp to prevent back navigation
    localStorage.setItem('loggedOut', Date.now().toString());
  };

  // Set axios auth header
  useEffect(() => {
    if (user && user.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
