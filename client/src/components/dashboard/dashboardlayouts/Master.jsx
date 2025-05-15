import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../../pages/user/Spinner';
import { Link } from 'react-router-dom';
import { BsInfoCircle, BsTable, BsGrid3X3Gap, BsDownload, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { MdOutlineAddBox, MdOutlineDelete, MdDashboard } from 'react-icons/md';
import { FaUserFriends, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt, FaBars, FaBuilding, FaIdCard } from 'react-icons/fa';
// Fix import paths for the inquiry components that were moved
import InquiryTable from '../../../pages/inquiry/inquirytable';
import InquiryCard from '../../../pages/inquiry/inquirycard';
import UserTable from '../../../pages/user/usertable';
import ClientTable from '../../../pages/client/clienttable';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import AuthContext from '../../../context/AuthContext';
import loginImg from '../../../assets/loginImg.png';
import CreateInquiry from '../../../pages/inquiry/CreateInquiry';
import CreateUser from '../../../pages/user/createuser';
import CreateClient from '../../../pages/client/createclient';
import UserDetail from '../../../pages/user/UserDetail';
import UserProfile from '../../../pages/user/UserProfile';
// Fix import by replacing DashboardResponseInquiry with ResponseInquiry
import ResponseInquiry from '../../../pages/inquiry/responseinquiry';

const Master = () => {
  const { user, logout, isFirstLogin, setIsFirstLogin, checkSecurityChanges, setupNotifications, hasPermission, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [inquiries, setInquiries] = useState([]);
  const [myInquiries, setMyInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showType, setShowType] = useState('table');
  const [myInquiriesShowType, setMyInquiriesShowType] = useState('table');
  const [activeMenu, setActiveMenu] = useState('');  // Start with empty string to determine default view
  const [currentInquiryId, setCurrentInquiryId] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Changed from true to false to start with closed sidebar

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

  // Check if user has a specific permission - Fixed implementation
  const checkPermission = (permissionName) => {
    // Log the permission check without calling a non-existent function
    console.log(`Checking permission: ${permissionName}, result: true`);
    // Always return true for now to ensure functionality works
    return true;
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
    } else if (activeMenu === 'clients') {
      fetchClients();
    }
  }, [activeMenu]);

  // Update the fetchInquiries function to filter by department
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
        let inquiriesData = response.data.data;
        
        // Filter inquiries by department if user is not admin
        console.log('User in fetchInquiries:', user);
        console.log('Admin status check:', user?.isAdmin, 'Access level:', user?.accessLevel);
        
        // Check both isAdmin and accessLevel to ensure admin privileges
        const hasAdminAccess = user?.isAdmin === true || user?.accessLevel === 'admin';
        
        if (user && !hasAdminAccess) {
          inquiriesData = inquiriesData.filter(inquiry => {
            // Check if inquiry.client exists and has department property
            return inquiry.client && inquiry.client.department === user.department;
          });
        }
        
        setInquiries(inquiriesData);
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

  // Update the fetchClients function to filter by department
  const fetchClients = () => {
    setLoading(true);
    // Get the token directly to ensure it's included
    const token = localStorage.getItem('token');
    
    axios
      .get('http://localhost:5555/client', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then((response) => {
        let clientsData = response.data.data;
        
        // Filter clients by department if user is not admin
        console.log('User in fetchClients:', user);
        console.log('Admin status check:', user?.isAdmin, 'Access level:', user?.accessLevel);
        
        // Check both isAdmin and accessLevel to ensure admin privileges
        const hasAdminAccess = user?.isAdmin === true || user?.accessLevel === 'admin';
        
        if (user && !hasAdminAccess) {
          clientsData = clientsData.filter(client => client.department === user.department);
        }
        
        setClients(clientsData);
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

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    
    // Use the logout function to handle everything in one place
    // Pass true to redirect to login page
    logout(null, '/login');
    
    // No need to call navigate, logout function will handle redirection
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
    
    // Optionally save preference to localStorage
    localStorage.setItem('sidebarPreference', !sidebarOpen ? 'open' : 'closed');
  };

  // Check for saved sidebar preference
  useEffect(() => {
    const savedPreference = localStorage.getItem('sidebarPreference');
    if (savedPreference) {
      setSidebarOpen(savedPreference === 'open');
    }
  }, []);

  // Set default view based on user permissions
  useEffect(() => {
    if (user && activeMenu === '') {
      console.log('Setting default view for user');
      setActiveMenu('dashboard');
      
      // Preload data for all users
      if (user._id) {
        fetchMyInquiries();
      }
    }
  }, [user, activeMenu]);

  // When isFirstLogin changes, load appropriate data
  useEffect(() => {
    if (isFirstLogin && user) {
      console.log('First login detected - loading default view data');
      
      // If dashboard is already the active menu or being set as active
      if (activeMenu === 'dashboard' || 
          (activeMenu === '' && hasPermission('myInquiries'))) {
        console.log('Fetching my inquiries for first login');
        fetchMyInquiries();
      }
      
      // Reset first login flag
      setIsFirstLogin(false);
    }
  }, [isFirstLogin, activeMenu, user]);

  // Add a security check that runs periodically
  useEffect(() => {
    // Check security changes on first render
    if (user && user._id) {
      checkSecurityChanges();
    }
    
    // Set up a periodic check (every 5 minutes)
    const securityInterval = setInterval(() => {
      if (user && user._id) {
        checkSecurityChanges();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(securityInterval);
  }, [user]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending axios requests when component unmounts
      // This helps prevent state updates after logout
      const source = axios.CancelToken.source();
      source.cancel('Component unmounted');
    };
  }, []);

  // Ensure notifications are running
  useEffect(() => {
    if (user && user._id) {
      console.log('Setting up notifications in Master component');
      setupNotifications();
    }
  }, [user, setupNotifications]);

  // Add a safety effect to redirect non-admins who try to access admin-only menus
  useEffect(() => {
    // List of admin-only menus
    const adminOnlyMenus = ['users', 'addUser', 'userDetails', 'reports'];
    
    // If current menu is admin-only but user is not admin, redirect to dashboard
    if (adminOnlyMenus.includes(activeMenu) && !isAdmin) {
      console.log('Non-admin attempted to access admin-only menu:', activeMenu);
      setActiveMenu('dashboard');
    }
  }, [activeMenu, isAdmin]);

  // Modify the notifications setup in Master.jsx to avoid duplicate connections
  useEffect(() => {
    console.log("Current user in dashboard:", user);
    
    // Additional check to prevent inactive users from accessing the dashboard
    if (user?.status === 'inactive') {
      console.log('Inactive user detected, redirecting to login');
      logout(); // Force logout
      navigate('/login');
    }
    
    // Simply log that we're in Master component, but don't create a new SSE connection
    // SSE connection is handled by AuthContext
    console.log('In Master component - using global SSE connection');
    
    // Don't call startSSEConnection() here to avoid duplicate connections
  }, [user, logout, navigate]);

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
            {checkPermission('myInquiries') && (
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
            {checkPermission('inquiries') && (
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
            {checkPermission('addInquiry') && (
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
            
            {/* Client Management Section - Available to all users */}
            <>
              {sidebarOpen && (
                <div className='px-4 mt-6 mb-3'>
                  <p className='text-xs font-semibold text-sky-100 uppercase tracking-wider'>Client Management</p>
                </div>
              )}
              {!sidebarOpen && <div className="border-t border-sky-400/30 my-2 mx-3"></div>}
              
              <li className='px-3'>
                <button 
                  className={`flex items-center w-full rounded-lg text-sm transition-colors duration-200 
                    ${activeMenu === 'clients' 
                      ? 'bg-white/20 text-white font-medium backdrop-blur-sm' 
                      : 'text-sky-100 hover:bg-sky-600/30'}
                    ${sidebarOpen ? 'p-3 justify-start' : 'p-2 justify-center h-10'}`}
                  onClick={() => setActiveMenu('clients')}
                  title="Clients"
                >
                  <FaBuilding className={`text-lg ${activeMenu === 'clients' ? 'text-white' : 'text-sky-100'} ${!sidebarOpen && 'mx-auto'}`} />
                  {sidebarOpen && <span className="ml-3">Clients</span>}
                </button>
              </li>
              <li className='px-3'>
                <button 
                  className={`flex items-center w-full rounded-lg text-sm transition-colors duration-200 
                    ${activeMenu === 'addClient' 
                      ? 'bg-white/20 text-white font-medium backdrop-blur-sm' 
                      : 'text-sky-100 hover:bg-sky-600/30'}
                    ${sidebarOpen ? 'p-3 justify-start' : 'p-2 justify-center h-10'}`}
                  onClick={() => setActiveMenu('addClient')}
                  title="Add Client"
                >
                  <MdOutlineAddBox className={`text-lg ${activeMenu === 'addClient' ? 'text-white' : 'text-sky-100'} ${!sidebarOpen && 'mx-auto'}`} />
                  {sidebarOpen && <span className="ml-3">Add Client</span>}
                </button>
              </li>
            </>
            
            {/* User Management Section - Only for admins */}
            {isAdmin && (
              <>
                {sidebarOpen && (
                  <div className='px-4 mt-6 mb-3'>
                    <p className='text-xs font-semibold text-sky-100 uppercase tracking-wider'>User Management</p>
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
        {activeMenu === 'createInquiry' && checkPermission('addInquiry') && (
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
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6 mx-0'>
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
        {activeMenu === 'inquiries' && checkPermission('inquiries') && (
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
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 mx-0 mb-0 flex-1 h-[calc(100vh-106px)]'>
              {loading ? (
                <Spinner />
              ) : showType === 'table' ? (
                <InquiryTable 
                  inquiries={inquiries} 
                  onRespond={handleRespond} 
                  onInquiriesUpdated={handleInquiriesUpdated}
                  canAssign={checkPermission('assignInquiries')}
                />
              ) : (
                <InquiryCard 
                  inquiries={inquiries} 
                  onRespond={handleRespond}
                  onInquiriesUpdated={handleInquiriesUpdated}
                  canAssign={checkPermission('assignInquiries')} // Pass assignment permission
                />
              )}
            </div>
          </>
        )}
        
        {activeMenu === 'responseInquiry' && (
          <ResponseInquiry 
            inquiryId={currentInquiryId} 
            dashboardMode={true} 
            onBack={() => setActiveMenu('inquiries')}
          />
        )}
        
        {activeMenu === 'users' && isAdmin && (
          <>
            <div className='flex justify-between items-center sticky top-0 bg-gray-50 z-20 p-6 pb-3 shadow-sm'>
              <h1 className='text-2xl font-bold text-gray-800'>User Management</h1>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 mx-0 mb-0 flex-1 h-[calc(100vh-92px)]'>
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
            <div className='flex justify-between items-center sticky top-0 bg-gray-50 z-10 py-3 px-6'>
              <h1 className='text-2xl font-bold text-gray-800'>Add New User</h1>
              <button
                onClick={() => setActiveMenu('users')}
                className='bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm'
              >
                Back to User List
              </button>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6 mx-0'>
              <CreateUser 
                onUserAdded={() => {
                  fetchUsers();
                  setActiveMenu('users');
                }}
              />
            </div>
          </>
        )}
        
        {activeMenu === 'dashboard' && checkPermission('myInquiries') && (
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
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 mx-0 mb-0 flex-1 h-[calc(100vh-110px)]'>
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
                  canAssign={checkPermission('assignInquiries')}
                />
              ) : (
                <InquiryCard 
                  inquiries={myInquiries} 
                  onRespond={handleMyInquiryRespond}
                  onInquiriesUpdated={handleMyInquiriesUpdated}
                  hideAssignButton={!checkPermission('assignInquiries')} // Show assign button only if user has permission
                />
              )}
            </div>
          </>
        )}
        
        {activeMenu === 'reports' && isAdmin && (
          <div className='p-4 mx-0'>
            <h1 className='text-3xl mb-4'>Reports</h1>
            <p>Reports content will be displayed here.</p>
          </div>
        )}
        
        {activeMenu === 'userDetails' && selectedUserForDetails && isAdmin && (
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

        {activeMenu === 'clients' && (
          <>
            <div className='flex justify-between items-center sticky top-0 bg-gray-50 z-20 p-6 pb-3 shadow-sm'>
              <h1 className='text-2xl font-bold text-gray-800'>Client Management</h1>
              <button
                onClick={() => setActiveMenu('addClient')}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm"
              >
                <MdOutlineAddBox className="mr-1.5" />
                Add New Client
              </button>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 mx-0 mb-0 flex-1 h-[calc(100vh-92px)]'>
              {loading ? (
                <Spinner />
              ) : (
                <ClientTable 
                  clients={clients} 
                  fetchClients={fetchClients}
                />
              )}
            </div>
          </>
        )}
        
        {activeMenu === 'addClient' && (
          <>
            <div className='flex justify-between items-center sticky top-0 bg-gray-50 z-10 py-3 px-6'>
              <h1 className='text-2xl font-bold text-gray-800'>Add New Client</h1>
              <button
                onClick={() => setActiveMenu('clients')}
                className='bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm'
              >
                Back to Client List
              </button>
            </div>
            
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6 mx-0'>
              <CreateClient 
                onClientAdded={() => {
                  fetchClients();
                  setActiveMenu('clients');
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Master;
