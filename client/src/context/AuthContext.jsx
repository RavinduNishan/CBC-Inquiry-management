import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check for user data in localStorage on mount
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
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
            
            // Update user with fresh data from the server, including permissions
            setUser({
              ...userData,
              ...res.data, // This ensures we have the latest data including permissions
            });
            
            setIsAuthenticated(true);
          } catch (err) {
            console.error('Error verifying token:', err);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading user from localStorage', err);
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('http://localhost:5555/user/login', {
        email,
        password
      });
      
      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(res.data));
      localStorage.setItem('token', res.data.token);
      localStorage.removeItem('loggedOut');
      
      // Set user context
      setUser(res.data);
      setIsAuthenticated(true);
      
      console.log('User logged in, permissions:', res.data.permissions);
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.setItem('loggedOut', 'true');
    
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Check if user is admin
  const isAdmin = user && user.accessLevel === 'Administrator';
  
  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
