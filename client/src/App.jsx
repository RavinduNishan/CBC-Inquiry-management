import React, { useEffect, useRef, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext'; 
import { LoginBlade } from './components/dashboard/LoginBlade';
import Master from './components/dashboard/dashboardlayouts/Master';
import { SnackbarProvider } from 'notistack';
import ForgotPassword from './pages/auth/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';

// Create a component that uses the auth context
const AuthedApp = () => {
  const { isAuthenticated, user, startSSEConnection } = useContext(AuthContext);
  
  // Add a ref to prevent multiple calls
  const setupRef = useRef(false);
  
  useEffect(() => {
    // Only set up notifications once per session
    if (isAuthenticated && user && !setupRef.current) {
      console.log('Setting up notifications in AuthedApp');
      startSSEConnection();
      setupRef.current = true;
    }
    
    return () => {
      // Reset setup state when component unmounts
      setupRef.current = false;
    };
  }, [isAuthenticated, user, startSSEConnection]);
  
  return (
    <Routes>
      <Route path="/login" element={<LoginBlade />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Master />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  // Add event handler to detect page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible, we'll trigger notification setup
        const event = new CustomEvent('app:tabFocus');
        window.dispatchEvent(event);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <SnackbarProvider 
          maxSnack={3}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <AuthedApp />
        </SnackbarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;