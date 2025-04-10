import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import { LoginBlade } from './components/dashboard/LoginBlade';
import Master from './components/dashboard/dashboardlayouts/Master';
import MongoDBStatus from './components/dashboard/MongoDBStatus';
import axios from 'axios';

// Network error fallback component
const NetworkError = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
    <div className="p-8 max-w-md bg-white rounded-xl shadow-md text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-4">Connection Error</h1>
      <p className="text-gray-600 mb-6">
        We couldn't connect to the server. This could be because:
      </p>
      <ul className="text-left text-gray-600 mb-6 list-disc pl-6">
        <li>The backend server is not running</li>
        <li>There is an issue with your internet connection</li>
        <li>The database connection is unavailable</li>
      </ul>
      <button 
        onClick={onRetry} 
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        Retry Connection
      </button>
    </div>
  </div>
);

// MongoDB Status Page component
const MongoDBStatusPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">MongoDB Connection Status</h1>
        <MongoDBStatus />
        
        <div className="mt-8 text-center">
          <a 
            href="/login" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const [serverOnline, setServerOnline] = useState(true);
  const [mongoError, setMongoError] = useState(false);
  
  // Check server connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await axios.get('http://localhost:5555/api/health', { timeout: 3000 });
        setServerOnline(true);
      } catch (err) {
        console.error('Server connection check failed:', err);
        setServerOnline(false);
      }
    };
    
    checkConnection();
  }, []);
  
  // Show loading state while checking auth
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Show network error if server is unreachable
  if (!serverOnline) {
    return <NetworkError onRetry={() => window.location.reload()} />;
  }
  
  // Show MongoDB error page if there is a database connection issue
  if (mongoError) {
    return <Navigate to="/mongodb-status" replace />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  const [mongoError, setMongoError] = useState(false);
  
  // Check MongoDB connection on app load
  useEffect(() => {
    const checkMongo = async () => {
      try {
        const response = await axios.get('http://localhost:5555/api/mongodb/status');
        setMongoError(response.data.status !== 'connected');
      } catch (error) {
        console.error('Failed to check MongoDB status:', error);
      }
    };
    
    checkMongo();
  }, []);
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginBlade />} />
          <Route path="/mongodb-status" element={<MongoDBStatusPage />} />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Master />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;