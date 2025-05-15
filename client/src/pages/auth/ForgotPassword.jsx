import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import loginImg from '../../assets/loginImg.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // State for multi-step form
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  // Timer state for OTP expiry
  const [timer, setTimer] = useState(900); // 15 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle timer for OTP expiry
  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      enqueueSnackbar("OTP has expired. Please request a new one.", { variant: 'warning' });
    }
    return () => clearInterval(interval);
  }, [timerActive, timer, enqueueSnackbar]);
  
  // Format timer as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      enqueueSnackbar('Please enter your email address', { variant: 'error' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Normalize email (trim and convert to lowercase)
      const normalizedEmail = email.trim().toLowerCase();
      
      const response = await axios.post('http://localhost:5555/user/forgot-password', {
        email: normalizedEmail
      });
      
      enqueueSnackbar(response.data.message, { variant: 'success' });
      
      // Move to step 2 (OTP verification)
      setStep(2);
      
      // Start the timer
      setTimer(900); // 15 minutes
      setTimerActive(true);
      
    } catch (error) {
      console.error('Error requesting OTP:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      enqueueSnackbar('Please enter the OTP sent to your email', { variant: 'error' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();
      
      const response = await axios.post('http://localhost:5555/user/verify-otp', {
        email: normalizedEmail,
        otp
      });
      
      // Store the reset token
      setResetToken(response.data.resetToken);
      
      enqueueSnackbar('OTP verified successfully', { variant: 'success' });
      
      // Move to step 3 (Reset password)
      setStep(3);
      setTimerActive(false);
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      const attemptsLeft = error.response?.data?.attemptsLeft;
      
      if (attemptsLeft) {
        enqueueSnackbar(`${errorMessage}. You have ${attemptsLeft} attempts left.`, { variant: 'error' });
      } else {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }
    
    if (newPassword.length < 6) {
      enqueueSnackbar('Password must be at least 6 characters long', { variant: 'error' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await axios.post('http://localhost:5555/user/reset-password-token', {
        resetToken,
        newPassword
      });
      
      enqueueSnackbar(response.data.message, { variant: 'success' });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      
      // If token expired, go back to step 1
      if (error.response?.status === 400 && error.response?.data?.message?.includes('expired')) {
        setStep(1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOTP = async () => {
    try {
      setIsSubmitting(true);
      
      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();
      
      const response = await axios.post('http://localhost:5555/user/forgot-password', {
        email: normalizedEmail
      });
      
      enqueueSnackbar(response.data.message, { variant: 'success' });
      
      // Reset timer
      setTimer(900);
      setTimerActive(true);
      
    } catch (error) {
      console.error('Error resending OTP:', error);
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 px-4">
      <div className="p-8 max-w-md w-full bg-white shadow-xl rounded-xl border border-gray-100">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center bg-indigo-100 rounded-full shadow-inner h-16 w-16 overflow-hidden">
            <img 
              src={loginImg} 
              alt="Logo" 
              className="h-14 w-14 object-cover"
            />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-800">Password Recovery</h1>
          <p className="mt-1 text-gray-500 text-center">
            Ceylon Beverage Can (Pvt) Ltd.
          </p>
        </div>

        {/* Step 1: Request OTP */}
        {step === 1 && (
          <form className="space-y-6" onSubmit={handleRequestOTP}>
            <div>
              <p className="text-sm text-gray-600 mb-6">
                Enter your email address below, and we'll send you a one-time password (OTP) to reset your password.
              </p>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : 'Send OTP'}
              </button>
            </div>
            
            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <form className="space-y-6" onSubmit={handleVerifyOTP}>
            <div>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a one-time password to <strong>{email}</strong>.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Enter the 6-digit code below to verify your identity.
              </p>
              
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                One-Time Password (OTP)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 border-gray-300 rounded-md text-center tracking-widest font-mono text-lg"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Timer display */}
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  OTP expires in <span className="font-medium text-indigo-600">{formatTime(timer)}</span>
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isSubmitting || timerActive && timer > 840} // Allow resend after 1 minute
                  className="text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : 'Verify OTP'}
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <button 
                type="button"
                className="text-sm text-gray-600 hover:text-gray-800"
                onClick={() => setStep(1)}
              >
                ← Change Email
              </button>
              <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Step 3: Set New Password */}
        {step === 3 && (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <p className="text-sm text-gray-600 mb-6">
                Create a new password for your account.
              </p>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 border-gray-300 rounded-md"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSubmitting}
                    minLength={6}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 border-gray-300 rounded-md"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password...
                  </>
                ) : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
