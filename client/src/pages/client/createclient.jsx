import React, { useState, useContext } from 'react';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { MdPersonAdd, MdPerson, MdEmail, MdPhone, MdBusiness } from 'react-icons/md';
import Spinner from '../user/Spinner';
import AuthContext from '../../context/AuthContext';

function CreateClient({ onClientAdded }) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    department: user?.department || 'CBC'
  });
  const [error, setError] = useState('');

  // Fixed: Explicitly check both isAdmin and accessLevel for admin privileges
  const hasAdminAccess = user?.isAdmin === true || user?.accessLevel === 'admin';
  console.log('Create client - user:', user);
  console.log('Create client - admin access:', hasAdminAccess);
  
  // Department options - all departments for admins, just user's department for others
  const allDepartments = ['CBC', 'CBI', 'M~Line'];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for different field types
    if (name === 'email') {
      // For email field, trim spaces as the user types
      setClientData({
        ...clientData,
        [name]: value.trim()
      });
    } else if (name === 'phone') {
      // For phone field, only allow numeric characters
      const numericValue = value.replace(/\D/g, '');
      setClientData({
        ...clientData,
        [name]: numericValue
      });
    } else {
      // For all other fields, update normally
      setClientData({
        ...clientData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form data
    if (!clientData.name || !clientData.email || !clientData.phone || !clientData.department) {
      setError('Please fill in all required fields');
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    // Normalize email address (trim spaces and convert to lowercase)
    const normalizedEmail = clientData.email.trim().toLowerCase();

    try {
      setLoading(true);
      
      // Ensure department stays the same for non-admin users
      const dataToSubmit = {
        name: clientData.name,
        email: normalizedEmail,
        phone: clientData.phone,
        department: user?.isAdmin ? clientData.department : user?.department
      };
      
      const response = await axios.post('http://localhost:5555/client', dataToSubmit);
      
      setLoading(false);
      enqueueSnackbar('Client created successfully', { variant: 'success' });
      
      // Reset form or notify parent component
      if (onClientAdded) {
        onClientAdded();
      } else {
        setClientData({
          name: '',
          email: '',
          phone: '',
          department: user?.department || 'CBC'
        });
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Error creating client';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg">
          <MdPersonAdd className="text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 border-b-2 border-amber-500 pb-1">Add New Client</h1>
          <p className="text-gray-600 mt-1">Create a new client record</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
          <span className="ml-3 text-gray-600">Creating client...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Information Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <MdPerson className="text-amber-500 mr-2" />
              Client Information
            </h3>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdPerson className="text-gray-500 mr-1.5" />
                  Client Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={clientData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                    placeholder="Enter client's name"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdPhone className="text-gray-500 mr-1.5" />
                  Phone Number (digits only)
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={clientData.phone}
                    onChange={handleInputChange}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                    placeholder="Enter digits only"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="department" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdBusiness className="text-gray-500 mr-1.5" />
                  Department
                </label>
                <div className="mt-1">
                  {hasAdminAccess ? (
                    <select
                      id="department"
                      name="department"
                      value={clientData.department}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                      required
                    >
                      {allDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border bg-gray-50">
                      {user?.department || 'CBC'}
                      <input
                        type="hidden"
                        name="department"
                        value={user?.department || 'CBC'}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdEmail className="text-gray-500 mr-1.5" />
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={clientData.email}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg shadow-sm transition-all"
            >
              <MdPersonAdd className="mr-2" />
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateClient;