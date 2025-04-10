import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// Configure axios globally for better connection handling
axios.defaults.timeout = 15000;  // 15 seconds timeout for connections
axios.defaults.maxRedirects = 5;

// Add interceptors for better error handling
axios.interceptors.request.use(
  config => {
    // Prevent caching issues which might affect SSL connections
    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';
    return config;
  },
  error => Promise.reject(error)
);

axios.interceptors.response.use(
  response => response,
  error => {
    // Log network errors for debugging
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED' || 
        (error.message && error.message.includes('SSL'))) {
      console.error('Network/SSL Connection Issue:', error);
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
