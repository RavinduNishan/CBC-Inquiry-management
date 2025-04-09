import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../../pages/user/Spinner';
import { Link } from 'react-router-dom';
import { BsInfoCircle, BsTable, BsGrid3X3Gap } from 'react-icons/bs';
import { MdOutlineAddBox, MdOutlineDelete, MdDashboard } from 'react-icons/md';
import { FaUserFriends, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt } from 'react-icons/fa';
// Fix import paths for the inquiry components that were moved
import InquiryTable from '../../../pages/inquiry/Inquiry/inquirytable';
import InquiryCard from '../../../pages/inquiry/Inquiry/inquirycard';
import UserTable from '../../../pages/user/usertable';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import AuthContext from '../../../context/AuthContext';
import loginImg from '../../../assets/loginImg.png';
import CreateInquiry from '../../../pages/inquiry/Inquiry/CreateInquiry';
import DashboardResponseInquiry from '../../../pages/inquiry/Inquiry/DashboardResponseInquiry';
import CreateUser from '../../../pages/user/createuser';
import UserDetail from '../../../pages/user/UserDetail';

const Master = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [inquiries, setInquiries] = useState([]);
  const [myInquiries, setMyInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showType, setShowType] = useState('table');
  const [myInquiriesShowType, setMyInquiriesShowType] = useState('table');
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
  const [currentInquiryId, setCurrentInquiryId] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  // Add authorization headers to axios requests
  const updateAxiosConfig = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // Apply token to default axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Also ensure that refreshed API calls have the token
      axios.interceptors.request.use(
        config => {
          if (!config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        error => Promise.reject(error)
      );
    }
  };

  // Initialize axios with auth headers
  useEffect(() => {
    updateAxiosConfig();
  }, []);

  // Enhanced check for authenticated and active users
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Additional check to prevent inactive users from accessing the dashboard
    if (user.status === 'inactive') {
      console.log('Inactive user detected, redirecting to login');
      logout(); // Force logout
      navigate('/login');
    }
  }, [user, navigate, logout]);

  useEffect(() => {
    if (activeMenu === 'inquiries') {
      fetchInquiries();
    } else if (activeMenu === 'dashboard') {
      fetchMyInquiries();
    } else if (activeMenu === 'users') {
      fetchUsers();
    }
  }, [activeMenu]);

  const fetchInquiries = () => {
    setLoading(true);
    // Get the token directly to ensure it's included
    const token = localStorage.getItem('token');
    
    axios
      .get('http://localhost:5555/inquiry', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then((response) => {
        setInquiries(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        // If unauthorized, redirect to login
        if (error.response && error.response.status === 401) {
          logout();
          navigate('/login');
        }
        setLoading(false);
      });
  };

  const fetchMyInquiries = () => {
    if (!user || !user._id) return;
    
    setLoading(true);
    // Get the token directly to ensure it's included
    const token = localStorage.getItem('token');
    
    axios
      .get('http://localhost:5555/inquiry', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then((response) => {
        // Filter inquiries assigned to the current user
        const assignedInquiries = response.data.data.filter(
          inquiry => inquiry.assigned && inquiry.assigned.userId === user._id
        );
        setMyInquiries(assignedInquiries);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        // If unauthorized, redirect to login
        if (error.response && error.response.status === 401) {
          logout();
          navigate('/login');
        }
        setLoading(false);
      });
  };

  const fetchUsers = () => {
    setLoading(true);
    // Get the token directly to ensure it's included
    const token = localStorage.getItem('token');
    
    axios
      .get('http://localhost:5555/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then((response) => {
        setUsers(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        // If unauthorized, redirect to login
        if (error.response && error.response.status === 401) {
          logout();
          navigate('/login');
        }
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

  // Add this with your other functions
  const handleRespond = (inquiryId) => {
    setCurrentInquiryId(inquiryId);
    setActiveMenu('responseInquiry');
  };

  // Improve the handleInquiriesUpdated function to ensure a complete refresh
  const handleInquiriesUpdated = () => {
    console.log("Refreshing inquiries after assignment...");
    setLoading(true);
    
    // Clear existing inquiries first to ensure UI updates
    setInquiries([]);
    
    // Add a small delay to ensure the database has time to update
    setTimeout(() => {
      // Ensure token is included in this request
      updateAxiosConfig();
      // Then fetch fresh data
      axios
        .get('http://localhost:5555/inquiry', {
          // Add cache-busting parameter to prevent stale data
          params: { _t: new Date().getTime() }
        })
        .then((response) => {
          console.log("Refreshed inquiries:", response.data.data);
          setInquiries(response.data.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error refreshing inquiries:", error);
          if (error.response && error.response.status === 401) {
            logout();
            navigate('/login');
          }
          setLoading(false);
        });
    }, 500); // 500ms delay
  };

  // Handle response for my inquiries
  const handleMyInquiryRespond = (inquiryId) => {
    setCurrentInquiryId(inquiryId);
    setActiveMenu('responseInquiry');
  };

  // Refresh my inquiries after update
  const handleMyInquiriesUpdated = () => {
    console.log("Refreshing my assigned inquiries...");
    setLoading(true);
    
    // Clear existing inquiries first to ensure UI updates
    setMyInquiries([]);
    
    // Add a small delay to ensure the database has time to update
    setTimeout(() => {
      // Ensure token is included in this request
      updateAxiosConfig();
      // Then fetch fresh data
      axios
        .get('http://localhost:5555/inquiry', {
          // Add cache-busting parameter to prevent stale data
          params: { _t: new Date().getTime() }
        })
        .then((response) => {
          // Filter inquiries assigned to the current user
          const assignedInquiries = response.data.data.filter(
            inquiry => inquiry.assigned && inquiry.assigned.userId === user._id
          );
          setMyInquiries(assignedInquiries);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error refreshing my inquiries:", error);
          if (error.response && error.response.status === 401) {
            logout();
            navigate('/login');
          }
          setLoading(false);
        });
    }, 500); // 500ms delay
  };

  const handleViewUserDetails = (user) => {
    setSelectedUserForDetails(user);
    setActiveMenu('userDetails');
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
              <img
                src={loginImg}
                alt="CBC Logo"
                className="h-full w-full object-contain rounded-full"
              />
            </div>
            <div className='ml-3'>
              <h2 className='font-semibold text-gray-800'>Inquiry Management</h2>
              <p className='text-xs text-gray-500'>Admin Portal</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className='flex-1 pt-4 pb-4 overflow-y-auto'>
          <div className='px-4 mb-3'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>Inquiries</p>
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
                My Inquiries
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
            <li className='px-3'>
              <button 
                className={`flex items-center w-full p-3 rounded-lg text-sm transition-colors duration-200 ${
                  activeMenu === 'createInquiry' 
                    ? 'bg-sky-50 text-sky-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveMenu('createInquiry')}
              >
                <MdOutlineAddBox className={`mr-3 text-lg ${activeMenu === 'createInquiry' ? 'text-sky-600' : 'text-gray-500'}`} />
                Add Inquiry
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
                      activeMenu === 'addUser' 
                        ? 'bg-sky-50 text-sky-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveMenu('addUser')}
                  >
                    <MdOutlineAddBox className={`mr-3 text-lg ${activeMenu === 'addUser' ? 'text-sky-600' : 'text-gray-500'}`} />
                    Add User
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
        {activeMenu === 'createInquiry' && (
          <>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-2xl font-bold text-gray-800'>Create New Inquiry</h1>
              <button
                onClick={() => setActiveMenu('inquiries')}
                className='bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm'
              >
                Back to Inquiry List
              </button>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6'>
              <CreateInquiry 
                onSuccess={() => {
                  setActiveMenu('inquiries');
                  fetchInquiries(); // Refresh the inquiries list
                }} 
              />
            </div>
          </>
        )}
        
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
                
              </div>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6'>
              <div className='flex justify-between items-center mb-6'>
                <div className='text-sm text-gray-500'>
                  {inquiries.length} {inquiries.length === 1 ? 'inquiry' : 'inquiries'} found
                </div>
              </div>
              
              {loading ? (
                <Spinner />
              ) : showType === 'table' ? (
                <InquiryTable 
                  inquiries={inquiries} 
                  onRespond={handleRespond} 
                  onInquiriesUpdated={handleInquiriesUpdated}
                />
              ) : (
                <InquiryCard 
                  inquiries={inquiries} 
                  onRespond={handleRespond}
                  onInquiriesUpdated={handleInquiriesUpdated}
                />
              )}
            </div>
          </>
        )}
        
        {activeMenu === 'responseInquiry' && (
          <DashboardResponseInquiry 
            inquiryId={currentInquiryId} 
            onBack={() => setActiveMenu('inquiries')}
          />
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
                <div className='text-sm text-gray-500'>
                  {users.length} {users.length === 1 ? 'user' : 'users'} found
                </div>
              </div>
              
              {loading ? (
                <Spinner />
              ) : (
                <UserTable 
                  users={users} 
                  fetchUsers={fetchUsers}
                  onViewDetails={handleViewUserDetails} 
                />
              )}
            </div>
          </>
        )}
        
        {activeMenu === 'addUser' && isAdmin && (
          <>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-2xl font-bold text-gray-800'>Add New User</h1>
              <button
                onClick={() => setActiveMenu('users')}
                className='bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm'
              >
                Back to User List
              </button>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6'>
              <CreateUser 
                onUserAdded={() => {
                  fetchUsers();
                  setActiveMenu('users');
                }}
              />
            </div>
          </>
        )}
        
        {activeMenu === 'dashboard' && (
          <>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-2xl font-bold text-gray-800'>My Assigned Inquiries</h1>
              <div className='flex items-center gap-4'>
                <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex'>
                  <button
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      myInquiriesShowType === 'table'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => setMyInquiriesShowType('table')}
                    title="Show as table"
                  >
                    <BsTable className={`mr-2 ${myInquiriesShowType === 'table' ? 'text-white' : 'text-gray-400'}`} />
                    Table
                  </button>
                  <button
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      myInquiriesShowType === 'card'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => setMyInquiriesShowType('card')}
                    title="Show as cards"
                  >
                    <BsGrid3X3Gap className={`mr-2 ${myInquiriesShowType === 'card' ? 'text-white' : 'text-gray-400'}`} />
                    Cards
                  </button>
                </div>
              </div>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6'>
              <div className='flex justify-between items-center mb-6'>
                <div className='text-sm text-gray-500'>
                  {myInquiries.length} {myInquiries.length === 1 ? 'inquiry' : 'inquiries'} assigned to you
                </div>
              </div>
              
              {loading ? (
                <Spinner />
              ) : myInquiries.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-500">
                    <p className="text-xl font-medium mb-2">No inquiries assigned to you yet</p>
                    <p className="text-sm">When inquiries are assigned to you, they will appear here.</p>
                  </div>
                </div>
              ) : myInquiriesShowType === 'table' ? (
                <InquiryTable 
                  inquiries={myInquiries} 
                  onRespond={handleMyInquiryRespond}
                  onInquiriesUpdated={handleMyInquiriesUpdated}
                  hideAssignButton={true}
                />
              ) : (
                <InquiryCard 
                  inquiries={myInquiries} 
                  onRespond={handleMyInquiryRespond}
                  onInquiriesUpdated={handleMyInquiriesUpdated}
                  hideAssignButton={true}
                />
              )}
            </div>
          </>
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

        {activeMenu === 'userDetails' && selectedUserForDetails && (
          <UserDetail 
            user={selectedUserForDetails}
            onBack={() => setActiveMenu('users')}
            onUserUpdated={() => {
              fetchUsers();
              setActiveMenu('users');
            }}
          />
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Add New User
                  </Dialog.Title>
                  
                  <form onSubmit={handleAddUser}>
                    {error && (
                      <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
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
                    
                    {/* Only show permissions if access level is Staff Member */}
                    {newUser.accessLevel === 'Staff Member' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Permissions
                        </label>
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-2">
                          <p className="text-xs text-gray-500 mb-2">
                            Select permissions for this staff member:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {['View Inquiries', 'Respond to Inquiries', 'Create Inquiries'].map((permission) => (
                              <label key={permission} className="flex items-center space-x-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={newUser.permissions.includes(permission)}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    setNewUser({
                                      ...newUser,
                                      permissions: isChecked 
                                        ? [...newUser.permissions, permission]
                                        : newUser.permissions.filter(p => p !== permission)
                                    });
                                  }}
                                  className="rounded text-sky-600 focus:ring-sky-500"
                                />
                                <span>{permission}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
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
