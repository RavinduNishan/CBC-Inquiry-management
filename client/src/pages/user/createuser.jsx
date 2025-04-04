import React, { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton';
import Spinner from '../../components/Spinner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const CreateUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accessLevel, setAccessLevel] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [status, setStatus] = useState('active');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (accessLevel === 'admin') {
      setPermissions(['read', 'write', 'delete', 'manage_users']);
    } else {
      setPermissions([]);
    }
  }, [accessLevel]);

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setPermissions([...permissions, value]);
    } else {
      setPermissions(permissions.filter(permission => permission !== value));
    }
  };

  const handleSaveUser = async () => {
    try {
      setError('');
      
      if (!name || !email || !phone || !accessLevel || !password || !confirmPassword) {
        throw new Error('Please fill all required fields');
      }
  
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
  
      if (accessLevel === 'staff' && permissions.length === 0) {
        throw new Error('Please select at least one permission for staff members');
      }
      
      const data = {
        name,
        email,
        phone,
        accessLevel,
        permissions: accessLevel === 'admin' ? ['read', 'write', 'delete', 'manage_users'] : permissions,
        status: status || 'active',
        password
      };
      
      setLoading(true);
      
      const response = await axios.post('http://localhost:5555/user', data);
      
      enqueueSnackbar('User created successfully', { variant: 'success' });
      navigate('/user');
    } catch (error) {
      console.error('Error creating user:', error);
      
      let errorMessage = 'Error creating user';
      if (error.response) {
        errorMessage = error.response.data.message || error.response.statusText;
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        <div className='flex items-center mb-8'>
          <BackButton destination="/users" />
          <h1 className='text-3xl font-bold text-gray-900 ml-4'>Create New User</h1>
        </div>
        
        {loading && (
          <div className='flex justify-center my-8'>
            <Spinner />
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
          <div className='px-4 py-5 sm:px-6 border-b border-gray-200'>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>User Information</h3>
            <p className='mt-1 text-sm text-gray-500'>Fill in the details to create a new user account.</p>
          </div>
          
          <div className='px-4 py-5 sm:p-6'>
            <div className='grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6'>
              <div className='sm:col-span-6'>
                <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                  Full Name *
                </label>
                <div className='mt-1'>
                  <input
                    type='text'
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    placeholder='John Doe'
                    required
                  />
                </div>
              </div>

              <div className='sm:col-span-6'>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                  Email Address *
                </label>
                <div className='mt-1'>
                  <input
                    type='email'
                    id='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    placeholder='user@example.com'
                    required
                  />
                </div>
              </div>

              <div className='sm:col-span-6'>
                <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>
                  Phone Number *
                </label>
                <div className='mt-1'>
                  <input
                    type='tel'
                    id='phone'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    placeholder='+1 (555) 123-4567'
                    required
                  />
                </div>
              </div>

              <div className='sm:col-span-3'>
                <label htmlFor='accessLevel' className='block text-sm font-medium text-gray-700'>
                  Access Level *
                </label>
                <div className='mt-1'>
                  <select
                    id='accessLevel'
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    required
                  >
                    <option value="">Select access level</option>
                    <option value="admin">Administrator</option>
                    <option value="staff">Staff Member</option>
                  </select>
                </div>
              </div>

              <div className='sm:col-span-3'>
                <label htmlFor='status' className='block text-sm font-medium text-gray-700'>
                  Account Status
                </label>
                <div className='mt-1'>
                  <select
                    id='status'
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {accessLevel === 'staff' && (
                <div className='sm:col-span-6'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Permissions *
                  </label>
                  <p className='text-sm text-gray-500 mb-2'>Select the permissions this staff member should have</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="read-permission"
                          type="checkbox"
                          value="read"
                          checked={permissions.includes('read')}
                          onChange={handlePermissionChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="read-permission" className="font-medium text-gray-700">Read</label>
                        <p className="text-gray-500">View content and data</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="write-permission"
                          type="checkbox"
                          value="write"
                          checked={permissions.includes('write')}
                          onChange={handlePermissionChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="write-permission" className="font-medium text-gray-700">Write</label>
                        <p className="text-gray-500">Create and modify content</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="delete-permission"
                          type="checkbox"
                          value="delete"
                          checked={permissions.includes('delete')}
                          onChange={handlePermissionChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="delete-permission" className="font-medium text-gray-700">Delete</label>
                        <p className="text-gray-500">Remove content and data</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className='sm:col-span-3'>
                <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                  Password *
                </label>
                <div className='mt-1'>
                  <input
                    type='password'
                    id='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    placeholder='••••••••'
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">Minimum 8 characters</p>
              </div>

              <div className='sm:col-span-3'>
                <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
                  Confirm Password *
                </label>
                <div className='mt-1'>
                  <input
                    type='password'
                    id='confirmPassword'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    placeholder='••••••••'
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='px-4 py-3 bg-gray-50 text-right sm:px-6'>
            <button
              type='button'
              onClick={handleSaveUser}
              className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            >
              Create User
            </button>
          </div>
        </div>

        <div className='mt-8 bg-white shadow sm:rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>About User Roles</h3>
            <div className='mt-2 max-w-xl text-sm text-gray-500'>
              <p>
                <strong>Administrators</strong> have full access to all system features and settings.
                They can manage other users and have all permissions by default.
              </p>
              <p className='mt-2'>
                <strong>Staff Members</strong> have limited access based on the specific permissions
                you assign to them. Carefully consider which permissions each staff member needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateUser;