import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../Spinner';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle, BsTable, BsGrid3X3Gap } from 'react-icons/bs';
import { MdOutlineAddBox, MdOutlineDelete, MdDashboard } from 'react-icons/md';
import { FaUserFriends, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt } from 'react-icons/fa';
import InquiryTable from '../../Inquiry/inquirytable';
import InquiryCard from '../../Inquiry/inquirycard';
import UserTable from '../../User/UserTable';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import AuthContext from '../../../context/AuthContext';

const Master = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [inquiries, setInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showType, setShowType] = useState('table');
  const [activeMenu, setActiveMenu] = useState('inquiries');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    accessLevel: 'Staff Member',
    permissions: [],
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeMenu === 'inquiries') {
      fetchInquiries();
    } else if (activeMenu === 'users') {
      fetchUsers();
    }
  }, [activeMenu]);

  const fetchInquiries = () => {
    setLoading(true);
    axios
      .get('http://localhost:5555/inquiry')
      .then((response) => {
        setInquiries(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const fetchUsers = () => {
    setLoading(true);
    axios
      .get('http://localhost:5555/user')
      .then((response) => {
        setUsers(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (newUser.password !== newUser.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5555/user', {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        accessLevel: newUser.accessLevel,
        permissions: [],
        password: newUser.password,
        status: 'active'
      });
      setIsAddUserModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        accessLevel: 'Staff Member',
        permissions: [],
        password: '',
        confirmPassword: '',
      });
      fetchUsers();
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <div className='w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col'>
        {/* Sidebar Header */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center'>
            <div className='h-10 w-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-xl'>
              CBC
            </div>
            <div className='ml-3'>
              <h2 className='font-semibold text-gray-800'>CBC Management</h2>
              <p className='text-xs text-gray-500'>Admin Portal</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className='flex-1 pt-4 pb-4 overflow-y-auto'>
          <div className='px-4 mb-3'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Main</p>
          </div>
          <ul>
            <li className='px-3'>
              <button 
                className={`flex items-center w-full p-3 rounded-lg text-sm transition-colors duration-200 ${
                  activeMenu === 'dashboard' 
                    ? 'bg-sky-50 text-sky-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveMenu('dashboard')}
              >
                <MdDashboard className={`mr-3 text-lg ${activeMenu === 'dashboard' ? 'text-sky-600' : 'text-gray-500'}`} />
                Dashboard
              </button>
            </li>
            <li className='px-3'>
              <button 
                className={`flex items-center w-full p-3 rounded-lg text-sm transition-colors duration-200 ${
                  activeMenu === 'inquiries' 
                    ? 'bg-sky-50 text-sky-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveMenu('inquiries')}
              >
                <FaClipboardList className={`mr-3 text-lg ${activeMenu === 'inquiries' ? 'text-sky-600' : 'text-gray-500'}`} />
                Inquiries
              </button>
            </li>

            {isAdmin && (
              <>
                <div className='px-4 mt-6 mb-3'>
                  <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Management</p>
                </div>
                
                <li className='px-3'>
                  <button 
                    className={`flex items-center w-full p-3 rounded-lg text-sm transition-colors duration-200 ${
                      activeMenu === 'users' 
                        ? 'bg-sky-50 text-sky-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveMenu('users')}
                  >
                    <FaUserFriends className={`mr-3 text-lg ${activeMenu === 'users' ? 'text-sky-600' : 'text-gray-500'}`} />
                    Users
                  </button>
                </li>
                <li className='px-3'>
                  <button 
                    className={`flex items-center w-full p-3 rounded-lg text-sm transition-colors duration-200 ${
                      activeMenu === 'reports' 
                        ? 'bg-sky-50 text-sky-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveMenu('reports')}
                  >
                    <FaChartBar className={`mr-3 text-lg ${activeMenu === 'reports' ? 'text-sky-600' : 'text-gray-500'}`} />
                    Reports
                  </button>
                </li>
                <li className='px-3'>
                  <button 
                    className={`flex items-center w-full p-3 rounded-lg text-sm transition-colors duration-200 ${
                      activeMenu === 'settings' 
                        ? 'bg-sky-50 text-sky-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveMenu('settings')}
                  >
                    <FaCog className={`mr-3 text-lg ${activeMenu === 'settings' ? 'text-sky-600' : 'text-gray-500'}`} />
                    Settings
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className='p-4 border-t border-gray-200'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center'>
              <div className='h-8 w-8 rounded-full bg-gray-300'></div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-700'>{user.name}</p>
                <p className='text-xs text-gray-500'>{user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className='text-gray-500 hover:text-red-500'
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 p-6 overflow-auto'>
        {activeMenu === 'inquiries' && (
          <>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-2xl font-bold text-gray-800'>Inquiry Management</h1>
              <div className='flex items-center gap-4'>
                <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex'>
                  <button
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      showType === 'table'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => setShowType('table')}
                    title="Show as table"
                  >
                    <BsTable className={`mr-2 ${showType === 'table' ? 'text-white' : 'text-gray-400'}`} />
                    Table
                  </button>
                  <button
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      showType === 'card'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => setShowType('card')}
                    title="Show as cards"
                  >
                    <BsGrid3X3Gap className={`mr-2 ${showType === 'card' ? 'text-white' : 'text-gray-400'}`} />
                    Cards
                  </button>
                </div>
                <Link 
                  to='/inquiry/create'
                  className='bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm'
                >
                  <MdOutlineAddBox className='mr-2' />
                  New Inquiry
                </Link>
              </div>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-700'>Inquiry List</h2>
                <div className='text-sm text-gray-500'>
                  {inquiries.length} {inquiries.length === 1 ? 'inquiry' : 'inquiries'} found
                </div>
              </div>
              
              {loading ? (
                <Spinner />
              ) : showType === 'table' ? (
                <InquiryTable inquiries={inquiries} />
              ) : (
                <InquiryCard inquiries={inquiries} />
              )}
            </div>
          </>
        )}
        
        {activeMenu === 'users' && isAdmin && (
          <>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-2xl font-bold text-gray-800'>User Management</h1>
              <div className='flex items-center gap-4'>
                <button 
                  onClick={() => setIsAddUserModalOpen(true)}
                  className='bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm'
                >
                  <MdOutlineAddBox className='mr-2' />
                  Add User
                </button>
              </div>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-700'>User List</h2>
                <div className='text-sm text-gray-500'>
                  {users.length} {users.length === 1 ? 'user' : 'users'} found
                </div>
              </div>
              
              {loading ? (
                <Spinner />
              ) : (
                <UserTable users={users} />
              )}
            </div>
          </>
        )}
        
        {activeMenu === 'dashboard' && (
          <div className='p-4'>
            <h1 className='text-3xl mb-4'>Dashboard</h1>
            <p>Dashboard content will be displayed here.</p>
          </div>
        )}
        
        {activeMenu === 'reports' && isAdmin && (
          <div className='p-4'>
            <h1 className='text-3xl mb-4'>Reports</h1>
            <p>Reports content will be displayed here.</p>
          </div>
        )}
        
        {activeMenu === 'settings' && isAdmin && (
          <div className='p-4'>
            <h1 className='text-3xl mb-4'>Settings</h1>
            <p>Settings content will be displayed here.</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Transition appear show={isAddUserModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAddUserModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Add New User
                  </Dialog.Title>
                  
                  {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleAddUser}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newUser.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newUser.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={newUser.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Level
                      </label>
                      <select
                        name="accessLevel"
                        value={newUser.accessLevel}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="Staff Member">Staff Member</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={newUser.password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={newUser.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsAddUserModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors duration-200"
                        disabled={loading}
                      >
                        {loading ? 'Adding...' : 'Add User'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Master;
