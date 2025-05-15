import React, { useState, useEffect } from 'react';
import axios from 'axios';
import loginImg from '../../assets/loginImg.png';
import { useSnackbar } from 'notistack';

const TwoFactorVerification = ({ verificationData, onSuccess, onCancel }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [verificationSuccess, setVerificationSuccess] = useState(false); // Add success state
  const { enqueueSnackbar } = useSnackbar();
  
  // Handle timer countdown
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdown);
  }, []);
  
  // Format timer as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle OTP input change
  const handleChange = (e) => {
    // Only allow digits
    const value = e.target.value.replace(/[^0-9]/g, '');
    setOtp(value);
    
    if (error) setError('');
  };
  
  // Handle OTP verification
  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    if (otp.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Verifying OTP code with server...');
      const response = await axios.post('http://localhost:5555/user/verify-login', {
        verificationId: verificationData.verificationId,
        otp
      });
      
      console.log('OTP verification successful, response:', response.data);
      
      // Show success state immediately
      setVerificationSuccess(true);
      enqueueSnackbar('Login successful! Preparing dashboard...', { variant: 'success' });
      
      // Add a small delay to show the success state before proceeding
      setTimeout(() => {
        // Call the success callback with the authenticated user data
        onSuccess(response.data);
      }, 800);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to verify code';
      const attemptsLeft = error.response?.data?.attemptsLeft;
      
      if (attemptsLeft) {
        setError(`${errorMessage}. ${attemptsLeft} attempts remaining.`);
      } else {
        setError(errorMessage);
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
      setLoading(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post('http://localhost:5555/user/resend-login-otp', {
        verificationId: verificationData.verificationId
      });
      
      // Reset timer
      setTimer(600);
      
      enqueueSnackbar('A new verification code has been sent to your email', { 
        variant: 'success' 
      });
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification code';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Update the return content for success state
  if (verificationSuccess) {
    return (
      <div className="p-8 max-w-md w-full bg-white shadow-xl rounded-xl border border-gray-100 text-center">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center bg-green-100 rounded-full shadow-inner h-16 w-16 overflow-hidden">
            <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-800">Verification Successful</h1>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-600">You're being redirected to the dashboard...</p>
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8 max-w-md w-full bg-white shadow-xl rounded-xl border border-gray-100">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center justify-center bg-indigo-100 rounded-full shadow-inner h-16 w-16 overflow-hidden">
          <img src={loginImg} alt="Logo" className="h-14 w-14 object-cover" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-800">Two-Step Verification</h1>
        <p className="mt-1 text-gray-500 text-center">
          Please verify your identity
        </p>
      </div>
      
      {/* Info Message */}
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              A verification code has been sent to <strong>{verificationData.email}</strong>
            </p>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleVerify}>
        {/* OTP Input */}
        <div className="mb-6">
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="otp"
              name="otp"
              type="text"
              value={otp}
              onChange={handleChange}
              maxLength={6}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 border-gray-300 rounded-md font-mono text-lg tracking-wider text-center"
              placeholder="______"
              autoComplete="one-time-code"
              disabled={loading}
              required
            />
          </div>
          
          {/* Timer and Resend */}
          <div className="mt-2 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Code expires in <span className="font-medium text-indigo-600">{formatTime(timer)}</span>
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading || timer > 540} // Allow resend after 1 minute
              className="text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Resend Code
            </button>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col space-y-3">
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : 'Verify'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default TwoFactorVerification;
