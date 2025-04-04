import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '../../Spinner';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle, BsTable, BsGrid3X3Gap } from 'react-icons/bs';
import { MdOutlineAddBox, MdOutlineDelete, MdDashboard } from 'react-icons/md';
import { FaUserFriends, FaClipboardList, FaChartBar, FaCog } from 'react-icons/fa';
import InquiryTable from '../../Inquiry/inquirytable';
import InquiryCard from '../../Inquiry/inquirycard';

const Master = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showType, setShowType] = useState('table');
  const [activeMenu, setActiveMenu] = useState('inquiries');

  useEffect(() => {
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
  }, []);

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
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className='p-4 border-t border-gray-200'>
          <div className='flex items-center'>
            <div className='h-8 w-8 rounded-full bg-gray-300'></div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-700'>Admin User</p>
              <p className='text-xs text-gray-500'>admin@cbcmanagement.com</p>
            </div>
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
                    <BsTable className={`mr                        npm install @headlessui/react-2 ${showType === 'table' ? 'text-white' : 'text-gray-400'}`} />
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
        
        {activeMenu === 'dashboard' && (
          <div className='p-4'>
            <h1 className='text-3xl mb-4'>Dashboard</h1>
            <p>Dashboard content will be displayed here.</p>
          </div>
        )}
        
        {activeMenu === 'users' && (
          <div className='p-4'>
            <h1 className='text-3xl mb-4'>User Management</h1>
            <p>User management content will be displayed here.</p>
          </div>
        )}
        
        {activeMenu === 'reports' && (
          <div className='p-4'>
            <h1 className='text-3xl mb-4'>Reports</h1>
            <p>Reports content will be displayed here.</p>
          </div>
        )}
        
        {activeMenu === 'settings' && (
          <div className='p-4'>
            <h1 className='text-3xl mb-4'>Settings</h1>
            <p>Settings content will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Master;
