import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../../pages/user/Spinner';
import { Link } from 'react-router-dom';
import { BsInfoCircle, BsTable, BsGrid3X3Gap, BsDownload, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { MdOutlineAddBox, MdOutlineDelete, MdDashboard } from 'react-icons/md';
import { FaUserFriends, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt, FaBars } from 'react-icons/fa';
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
import UserProfile from '../../../pages/user/UserProfile';

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
  const [currentInquiryId, setCurrentInquiryId] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Add state for sidebar toggle

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

  // Check if user has a specific permission
  const hasPermission = (permissionName) => {
    console.log("Checking permission:", permissionName, "for user:", user);
    console.log("User permissions:", user?.permissions);
    
    return (
      user &&
      (isAdmin || // Admins have all permissions
       (user.permissions && 
        Array.isArray(user.permissions) && 
        user.permissions.includes(permissionName)))
    );
  };

  // Initialize axios with auth headers
  useEffect(() => {
    updateAxiosConfig();
  }, []);

  // Enhanced check for authenticated and active users
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    // Log user details to debug permissions
    console.log("Current user in dashboard:", user);
    
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

  const handleLogout = () => {
    // Call the logout function from context
    logout();
    
    // Use replace instead of push to prevent back navigation
    navigate('/login', { replace: true });
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

  // Enhanced authentication check to run on every navigation or history event
  useEffect(() => {
    // Check authentication on component mount and on focus
    checkAuthState();
    
    // Add event listener for popstate (browser back/forward buttons)
    const handlePopState = () => {
      checkAuthState();
    };
    
    // Add event listener for when the page gets focus
    const handleFocus = () => {
      checkAuthState();
    };
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  // Enhanced function to check authentication state
  const checkAuthState = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const loggedOut = localStorage.getItem('loggedOut');
    
    // If user explicitly logged out or no valid auth data, redirect to login
    if (loggedOut || !token || !userData) {
      navigate('/login', { replace: true });
      return;
    }
    
    try {
      // Parse user data to check status
      const parsedUser = JSON.parse(userData);
      if (parsedUser.status === 'inactive') {
        logout();
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Error parsing user data', error);
      logout();
      navigate('/login', { replace: true });
    }
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!user) {
    return null;
  }

  return (
    <div className='flex h-screen bg-gray-50 relative'>
      {/* Updated sidebar with theme matching logo */}
      <div 
        className={`bg-gradient-to-b from-blue-700 via-sky-600 to-sky-500 shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out 
          ${sidebarOpen ? 'w-64' : 'w-16'} ${sidebarOpen ? '' : 'overflow-hidden'}`}
      >
        {/* Sidebar Header with enhanced styling */}
        <button 
          onClick={toggleSidebar}
          className='w-full p-4 border-b border-sky-400/30 flex justify-between items-center text-left hover:bg-sky-600/30 transition-colors cursor-pointer focus:outline-none'
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className='h-10 w-10 rounded-full bg-white flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md'>
              <img
                src={loginImg}
                alt="CBC Logo"
                className="h-full w-full object-contain rounded-full"
              />
            </div>
            {sidebarOpen && (
              <div className='ml-3 overflow-hidden whitespace-nowrap'>
                <h2 className='font-semibold text-white'>Inquiry Management</h2>
                <p className='text-xs text-sky-100'>CBC Admin Portal</p>
              </div>
            )}
          </div>
          {/* Chevron icon with updated color */}
          {sidebarOpen && (
            <BsChevronLeft size={16} className="text-sky-100" />
          )}
        </button>
        
        {/* Updated Navigation styling */}
        <nav className='flex-1 pt-4 pb-4 overflow-y-auto'>
          {sidebarOpen && (
            <div className='px-4 mb-3'>
              <p className='text-xs font-semibold text-sky-100 uppercase tracking-wider'>Inquiries</p>
            </div>
          )}
          <ul>
            {/* Only show My Inquiries if user has myInquiries permission - this is the default */}
            {hasPermission('myInquiries') && (
              <li className='px-3'>
                <button 
                  className={`flex items-center w-full rounded-lg text-sm transition-colors duration-200 
                    ${activeMenu === 'dashboard' 
                      ? 'bg-white/20 text-white font-medium backdrop-blur-sm' 
                      : 'text-sky-100 hover:bg-sky-600/30'}
                    ${sidebarOpen ? 'p-3 justify-start' : 'p-2 justify-center h-10'}`}
                  onClick={() => setActiveMenu('dashboard')}
                  title="My Inquiries"
                >
                  <MdDashboard className={`text-lg ${activeMenu === 'dashboard' ? 'text-white' : 'text-sky-100'} ${!sidebarOpen && 'mx-auto'}`} />
                  {sidebarOpen && <span className="ml-3">My Inquiries</span>}
                </button>
              </li>
            )}

            {/* Only show All Inquiries if user has inquiries permission */}
            {hasPermission('inquiries') && (
              <li className='px-3'>
                <button 
                  className={`flex items-center w-full rounded-lg text-sm transition-colors duration-200 
                    ${activeMenu === 'inquiries' 
                      ? 'bg-white/20 text-white font-medium backdrop-blur-sm' 
                      : 'text-sky-100 hover:bg-sky-600/30'}
                    ${sidebarOpen ? 'p-3 justify-start' : 'p-2 justify-center h-10'}`}
                  onClick={() => setActiveMenu('inquiries')}
                  title="Inquiries"
                >
                  <FaClipboardList className={`text-lg ${activeMenu === 'inquiries' ? 'text-white' : 'text-sky-100'} ${!sidebarOpen && 'mx-auto'}`} />
                  {sidebarOpen && <span className="ml-3">Inquiries</span>}
                </button>
              </li>
            )}

            {/* Only show Add Inquiry if user has addInquiry permission */}
            {hasPermission('addInquiry') && (
              <li className='px-3'>
                <button 
                  className={`flex items-center w-full rounded-lg text-sm transition-colors duration-200 
                    ${activeMenu === 'createInquiry' 
                      ? 'bg-white/20 text-white font-medium backdrop-blur-sm' 
                      : 'text-sky-100 hover:bg-sky-600/30'}
                    ${sidebarOpen ? 'p-3 justify-start' : 'p-2 justify-center h-10'}`}
                  onClick={() => setActiveMenu('createInquiry')}
                  title="Add Inquiry"
                >
                  <MdOutlineAddBox className={`text-lg ${activeMenu === 'createInquiry' ? 'text-white' : 'text-sky-100'} ${!sidebarOpen && 'mx-auto'}`} />
                  {sidebarOpen && <span className="ml-3">Add Inquiry</span>}
                </button>
              </li>
            )}
            
            {/* Admin section remains unchanged */}
            {isAdmin && (
              <>
                {sidebarOpen && (
                  <div className='px-4 mt-6 mb-3'>
                    <p className='text-xs font-semibold text-sky-100 uppercase tracking-wider'>Management</p>
                  </div>
                )}
                {!sidebarOpen && <div className="border-t border-sky-400/30 my-2 mx-3"></div>}
                
                <li className='px-3'>
                  <button 
                    className={`flex items-center w-full rounded-lg text-sm transition-colors duration-200 
                      ${activeMenu === 'users' 
                        ? 'bg-white/20 text-white font-medium backdrop-blur-sm' 
                        : 'text-sky-100 hover:bg-sky-600/30'}
                      ${sidebarOpen ? 'p-3 justify-start' : 'p-2 justify-center h-10'}`}
                    onClick={() => setActiveMenu('users')}
                    title="Users"
                  >
                    <FaUserFriends className={`text-lg ${activeMenu === 'users' ? 'text-white' : 'text-sky-100'} ${!sidebarOpen && 'mx-auto'}`} />
                    {sidebarOpen && <span className="ml-3">Users</span>}
                  </button>
                </li>
                <li className='px-3'>
                  <button 
                    className={`flex items-center w-full rounded-lg text-sm transition-colors duration-200 
                      ${activeMenu === 'addUser' 
                        ? 'bg-white/20 text-white font-medium backdrop-blur-sm' 
                        : 'text-sky-100 hover:bg-sky-600/30'}
                      ${sidebarOpen ? 'p-3 justify-start' : 'p-2 justify-center h-10'}`}
                    onClick={() => setActiveMenu('addUser')}
                    title="Add User"
                  >
                    <MdOutlineAddBox className={`text-lg ${activeMenu === 'addUser' ? 'text-white' : 'text-sky-100'} ${!sidebarOpen && 'mx-auto'}`} />
                    {sidebarOpen && <span className="ml-3">Add User</span>}
                  </button>
                </li>
                <li className='px-3'>
                  <button 
                    className={`flex items-center w-full rounded-lg text-sm transition-colors duration-200 
                      ${activeMenu === 'reports' 
                        ? 'bg-white/20 text-white font-medium backdrop-blur-sm' 
                        : 'text-sky-100 hover:bg-sky-600/30'}
                      ${sidebarOpen ? 'p-3 justify-start' : 'p-2 justify-center h-10'}`}
                    onClick={() => setActiveMenu('reports')}
                    title="Reports"
                  >
                    <FaChartBar className={`text-lg ${activeMenu === 'reports' ? 'text-white' : 'text-sky-100'} ${!sidebarOpen && 'mx-auto'}`} />
                    {sidebarOpen && <span className="ml-3">Reports</span>}
                  </button>
                </li>
                {/* Settings button removed */}
              </>
            )}
          </ul>
        </nav>
        
        {/* Updated User Profile section */}
        <div className={`border-t border-sky-400/30 bg-blue-800/30 backdrop-blur-sm flex ${sidebarOpen ? 'p-4' : 'p-2'}`}>
          {sidebarOpen ? (
            <div 
              className="flex justify-between items-center cursor-pointer hover:bg-blue-700/40 rounded-lg transition-colors p-2 w-full"
              onClick={() => setActiveMenu('profile')}
            >
              <div className='flex items-center'>
                <div className='h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm'>
                  <span className="text-blue-700 font-medium text-sm">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className='ml-3 overflow-hidden'>
                  <p className='text-sm font-medium text-white truncate'>{user.name}</p>
                  <p className='text-xs text-sky-100 truncate'>{user.email}</p>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering profile view
                  handleLogout();
                }}
                className='text-sky-100 hover:text-white hover:bg-red-500/20 p-1.5 rounded-full transition-colors'
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full space-y-2">
              {/* Profile button when sidebar is collapsed */}
              <button
                onClick={() => setActiveMenu('profile')}
                className="h-8 w-8 rounded-full bg-white hover:ring-2 hover:ring-white/30 transition-all cursor-pointer relative group"
                title="View Profile"
              >
                {/* First letter of user's name */}
                <span className="absolute inset-0 flex items-center justify-center text-blue-700 font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                
                {/* Tooltip */}
                <span className="absolute left-full ml-2 bg-blue-900/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  View Profile
                </span>
              </button>
              
              {/* Logout button when sidebar is collapsed */}
              <button
                onClick={handleLogout}
                className='text-sky-100 hover:text-white hover:bg-red-500/20 p-1 rounded-full transition-colors'
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Updated Mobile sidebar toggle button to match theme */}
      <div className="md:hidden fixed bottom-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-800 focus:outline-none"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <FaBars />
        </button>
      </div>

      {/* Main content - adjust padding based on sidebar state */}
      <div className='flex-1 overflow-auto relative transition-all duration-300'>
        {/* Restrict access to createInquiry based on permission */}
        {activeMenu === 'createInquiry' && hasPermission('addInquiry') && (
          <>
            <div className='flex justify-between items-center sticky top-0 bg-gray-50 z-20 p-6 pb-3'>
              <h1 className='text-2xl font-bold text-gray-800'>Create New Inquiry</h1>
              <button
                onClick={() => setActiveMenu('inquiries')}
                className='bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm'
              >
                Back to Inquiry List
              </button>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6 mx-6'>
              <CreateInquiry 
                onSuccess={() => {
                  setActiveMenu('inquiries');
                  fetchInquiries(); // Refresh the inquiries list
                }} 
              />
            </div>
          </>
        )}
        
        {/* Restrict access to inquiries based on permission */}
        {activeMenu === 'inquiries' && hasPermission('inquiries') && (
          <>
            <div className='flex justify-between items-center sticky top-0 bg-gray-50 z-20 p-6 pb-3 shadow-sm'>
              <h1 className='text-2xl font-bold text-gray-800'>Inquiry Management</h1>
              <div className='flex items-center gap-4'>
                <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex'>
                  <button
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      showType === 'table'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white text-gray-500 hover:bg-sky-50 hover:text-sky-600'
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
                        : 'bg-white text-gray-500 hover:bg-sky-50 hover:text-sky-600'
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
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 mx-6 mb-6 flex-1 h-[calc(100vh-106px)]'>
              {loading ? (
                <Spinner />
              ) : showType === 'table' ? (
                <InquiryTable 
                  inquiries={inquiries} 
                  onRespond={handleRespond} 
                  onInquiriesUpdated={handleInquiriesUpdated}
                  canAssign={hasPermission('assignInquiries')}
                />
              ) : (
                <InquiryCard 
                  inquiries={inquiries} 
                  onRespond={handleRespond}
                  onInquiriesUpdated={handleInquiriesUpdated}
                  canAssign={hasPermission('assignInquiries')} // Pass assignment permission
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
            <div className='flex justify-between items-center sticky top-0 bg-gray-50 z-20 p-6 pb-3 shadow-sm'>
              <h1 className='text-2xl font-bold text-gray-800'>User Management</h1>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 mx-6 mb-6 flex-1 h-[calc(100vh-92px)]'>
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
            <div className='flex justify-between items-center sticky top-0 bg-gray-50 z-10 py-3'>
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
        
        {activeMenu === 'dashboard' && hasPermission('myInquiries') && (
          <>
            <div className='flex justify-between items-center sticky top-0 bg-gray-50 z-20 p-6 pb-3 shadow-sm'>
              <h1 className='text-2xl font-bold text-gray-800'>My Assigned Inquiries</h1>
              <div className='flex items-center gap-4'>
                <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex'>
                  <button
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      myInquiriesShowType === 'table'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white text-gray-500 hover:bg-sky-50 hover:text-sky-600'
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
                        : 'bg-white text-gray-500 hover:bg-sky-50 hover:text-sky-600'
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
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 mx-6 mb-6 flex-1 h-[calc(100vh-110px)]'>
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
                  canAssign={hasPermission('assignInquiries')}
                />
              ) : (
                <InquiryCard 
                  inquiries={myInquiries} 
                  onRespond={handleMyInquiryRespond}
                  onInquiriesUpdated={handleMyInquiriesUpdated}
                  hideAssignButton={!hasPermission('assignInquiries')} // Show assign button only if user has permission
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

        {activeMenu === 'profile' && (
          <UserProfile 
            user={user} 
            onBack={() => setActiveMenu('dashboard')} 
          />
        )}
      </div>
    </div>
  );
};

export default Master;
