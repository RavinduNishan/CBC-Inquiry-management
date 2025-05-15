import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import { useSnackbar } from 'notistack';
import { MdPersonAdd, MdPerson, MdEmail, MdPhone, MdVerifiedUser, MdLock, MdBusiness, MdSecurity } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

// Custom CSS for toggle
const toggleStyles = `
  .toggle-checkbox:checked {
    right: 0;
    border-color: #10B981;
  }
  .toggle-checkbox:checked + .toggle-label {
    background-color: #10B981;
  }
  .toggle-label {
    transition: background-color 0.2s;
  }
`;

function CreateUser({ onUserAdded }) {
  const navigate = useNavigate(); // Add this
  const { isAdmin } = useContext(AuthContext); // Add this
  const { enqueueSnackbar } = useSnackbar();

  // Add security check to redirect non-admins
  useEffect(() => {
    if (!isAdmin) {
      console.log('Non-admin attempted to access user creation');
      enqueueSnackbar('You do not have permission to create users', { 
        variant: 'error' 
      });
      // As backup, navigate to dashboard
      navigate('/dashboard');
    }
  }, [isAdmin, navigate, enqueueSnackbar]);

  // Add style tag with toggle CSS
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = toggleStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: '',
    status: 'active', // Default status is active
    accessLevel: 'staff', // Default access level is staff
    twoFactorEnabled: true // Always set to true for new users
  });
  const [error, setError] = useState('');

  // Department options
  const departments = [
    'CBC',
    'CBI',
    'M~Line'
  ];
  
  // Access Level options
  const accessLevels = [
    { value: 'admin', label: 'Admin', description: 'Full system access and management' },
    { value: 'manager', label: 'Department Manager', description: 'Manage department and staff' },
    { value: 'staff', label: 'Staff Member', description: 'Regular staff access' }
  ];

  const handleInputChange = (e) => {
    // For email field, trim spaces as the user types
    if (e.target.name === 'email') {
      setUserData({
        ...userData,
        [e.target.name]: e.target.value.trim().toLowerCase()
      });
    } else {
      setUserData({
        ...userData,
        [e.target.name]: e.target.value
      });
    }
  };

  // Handle status toggle change
  const handleToggleChange = (e) => {
    setUserData({
      ...userData,
      status: e.target.checked ? 'active' : 'inactive'
    });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }

    // Validate form data
    if (!userData.name || !userData.email || !userData.phone || !userData.password || !userData.department) {
      setError('Please fill in all required fields');
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }
    
    // Validate email format
    if (!validateEmail(userData.email)) {
      setError('Please enter a valid email address');
      enqueueSnackbar('Please enter a valid email address', { variant: 'error' });
      return;
    }

    // Normalize email address (trim spaces and convert to lowercase)
    const normalizedEmail = userData.email.trim().toLowerCase();

    try {
      setLoading(true);
      
      console.log('Sending user data:', {
        name: userData.name,
        email: normalizedEmail,
        phone: userData.phone,
        department: userData.department,
        password: userData.password,
        status: userData.status,
        accessLevel: userData.accessLevel,
        twoFactorEnabled: true // Always set to true
      });
      
      const response = await axios.post('http://localhost:5555/user', {
        name: userData.name,
        email: normalizedEmail, // Use the normalized email
        phone: userData.phone,
        department: userData.department,
        password: userData.password,
        status: userData.status,
        accessLevel: userData.accessLevel,
        twoFactorEnabled: true // Always set to true
      });
      
      setLoading(false);
      enqueueSnackbar('User created successfully', { variant: 'success' });
      
      // Reset form
      setUserData({
        name: '',
        email: '',
        phone: '',
        department: '',
        password: '',
        confirmPassword: '',
        status: 'active', // Reset status to active
        accessLevel: 'staff', // Reset access level to staff
      });
      
      // Notify parent component if callback provided
      if (onUserAdded) {
        onUserAdded();
      }
      
    } catch (error) {
      setLoading(false);
      console.error('Error creating user:', error.response || error);
      const errorMessage = error.response?.data?.message || 'Error creating user';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg">
          <MdPersonAdd className="text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-1">Create New User</h1>
          <p className="text-gray-600 mt-1">Add a new user to the system</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 001.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner />
          <span className="ml-3 text-gray-600">Creating user...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <MdPerson className="text-indigo-500 mr-2" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdPerson className="text-gray-500 mr-1.5" />
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                    placeholder="Enter user's full name"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdEmail className="text-gray-500 mr-1.5" />
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdPhone className="text-gray-500 mr-1.5" />
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              {/* Department dropdown */}
              <div className="sm:col-span-3">
                <label htmlFor="department" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdBusiness className="text-gray-500 mr-1.5" />
                  Department
                </label>
                <div className="mt-1">
                  <select
                    id="department"
                    name="department"
                    value={userData.department}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Account & Security Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <MdLock className="text-indigo-500 mr-2" />
              Account & Security
            </h3>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-6">
              {/* Status toggle switch with improved styling */}
              <div className="sm:col-span-3">
                <div className="flex items-center h-full">
                  <label htmlFor="status-toggle" className="flex items-center text-sm font-medium text-gray-700 mr-4">
                    <MdVerifiedUser className="text-gray-500 mr-1.5" />
                    User Status
                  </label>
                  <div className="relative inline-block w-14 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      id="status-toggle"
                      name="status-toggle"
                      checked={userData.status === 'active'}
                      onChange={handleToggleChange}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                      style={{
                        transform: userData.status === 'active' ? 'translateX(0%)' : 'translateX(0)',
                        borderColor: userData.status === 'active' ? '#10B981' : '#D1D5DB'
                      }}
                    />
                    <label
                      htmlFor="status-toggle"
                      className="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in"
                      style={{ 
                        backgroundColor: userData.status === 'active' ? '#10B981' : '#D1D5DB' 
                      }}
                    ></label>
                  </div>
                  <span className={`text-sm font-medium ml-2 ${
                    userData.status === 'active' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {userData.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  {userData.status === 'active'
                    ? 'User will be able to login immediately after creation'
                    : 'User will be created but unable to login until activated'}
                </p>
              </div>
              
              {/* Access Level Selection - NEW */}
              <div className="sm:col-span-3">
                <label htmlFor="accessLevel" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdSecurity className="text-gray-500 mr-1.5" />
                  Access Level
                </label>
                <div className="mt-1">
                  <select
                    id="accessLevel"
                    name="accessLevel"
                    value={userData.accessLevel}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                  >
                    {accessLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {accessLevels.find(level => level.value === userData.accessLevel)?.description}
                </p>
              </div>
            </div>

            {/* Password section with enhanced styling */}
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <MdLock className="text-indigo-500 mr-1.5" />
                User Password
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={userData.password}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                      required
                      placeholder="Enter password"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={userData.confirmPassword}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                      required
                      placeholder="Confirm password"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Enter the same password again to confirm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg shadow-sm transition-all"
            >
              <MdPersonAdd className="mr-2" />
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateUser;
