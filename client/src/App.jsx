import React, { useEffect } from 'react';
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
  const { setupNotifications, isAuthenticated } = React.useContext(AuthContext);
  
  // Set up notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Setting up notifications in AuthedApp');
      setupNotifications();
    }
  }, [isAuthenticated, setupNotifications]);
  
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