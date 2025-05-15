import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

const TwoFactorSettings = () => {
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Two-Step Verification</h2>
      
      <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">How it works</h3>
        <p className="text-sm text-blue-700">
          Two-step verification is enabled by default for all users. Each time you sign in,
          you'll need to enter a verification code sent to your email in addition to your password.
          This adds an extra layer of security to your account.
        </p>
      </div>
      
      <div className="flex items-center justify-between py-3">
        <div>
          <h3 className="font-medium text-gray-800">Email Authentication</h3>
          <p className="text-sm text-gray-600">
            Verification code will be sent to your email ({user?.email}) when you sign in
          </p>
        </div>
        
        <div className="flex items-center">
          <span className="mr-3 text-sm text-green-600">Enabled</span>
          
          <button
            disabled={true}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 cursor-not-allowed"
          >
            <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-6" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Two-factor authentication is required for all users and cannot be disabled for security reasons.
        </p>
      </div>
    </div>
  );
};

export default TwoFactorSettings;
