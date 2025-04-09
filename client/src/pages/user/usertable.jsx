import React, { useState, useEffect } from 'react';
import { BsInfoCircle, BsSearch, BsDownload } from 'react-icons/bs';
import axios from 'axios';

const UserTable = ({ users, fetchUsers, onViewDetails }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Input states (form values)
  const [inputSearchTerm, setInputSearchTerm] = useState('');
  const [inputAccessLevelFilter, setInputAccessLevelFilter] = useState('');
  const [inputStatusFilter, setInputStatusFilter] = useState('');
  
  // Applied filter states (actual filters)
  const [searchTerm, setSearchTerm] = useState('');
  const [accessLevelFilter, setAccessLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Initialize filtered users with all users on component mount
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Apply filters when search button is clicked
  const handleSearch = (e) => {
    e && e.preventDefault();
    
    // Update the actual filter values from the input values
    setSearchTerm(inputSearchTerm);
    setAccessLevelFilter(inputAccessLevelFilter);
    setStatusFilter(inputStatusFilter);
    
    // Apply filters
    const result = users.filter(user => {
      const matchesSearchTerm = !inputSearchTerm || 
        user.name.toLowerCase().includes(inputSearchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(inputSearchTerm.toLowerCase());
      const matchesAccessLevel = !inputAccessLevelFilter || user.accessLevel === inputAccessLevelFilter;
      const matchesStatus = !inputStatusFilter || user.status === inputStatusFilter;
      return matchesSearchTerm && matchesAccessLevel && matchesStatus;
    });
    
    setFilteredUsers(result);
  };

  // Clear all filters
  const clearFilters = () => {
    // Clear input values
    setInputSearchTerm('');
    setInputAccessLevelFilter('');
    setInputStatusFilter('');
    
    // Clear applied filters
    setSearchTerm('');
    setAccessLevelFilter('');
    setStatusFilter('');
    
    // Reset to show all users
    setFilteredUsers(users);
  };
  
  // Generate CSV data from filtered users
  const generateCSV = () => {
    // Define the headers
    const headers = ['Name', 'Email', 'Phone', 'Access Level', 'Status', 'Permissions', 'Created At', 'Updated At'];
    
    // Create the CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data for each user
    filteredUsers.forEach(user => {
      // Format permissions to handle array data properly
      let permissions = user.accessLevel === 'Administrator' 
        ? 'All permissions' 
        : (user.permissions && user.permissions.length > 0 
            ? user.permissions.join('; ') 
            : 'No permissions');
      
      // Format status for better readability
      let status = user.status === 'active' ? 'Active' : 'Inactive';
      
      // Format dates for better readability with 24-hour format
      const dateOptions = { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
      };
      
      const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleString('en-US', dateOptions) : 'N/A';
      const updatedDate = user.updatedAt ? new Date(user.updatedAt).toLocaleString('en-US', dateOptions) : 'N/A';
      
      // Create CSV row and escape values that might contain commas
      const row = [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.phone || 'N/A'}"`,
        `"${user.accessLevel}"`,
        `"${status}"`,
        `"${permissions}"`,
        `"${createdDate}"`,
        `"${updatedDate}"`
      ].join(',');
      
      csvContent += row + '\n';
    });
    
    return csvContent;
  };
  
  // Download CSV file
  const downloadCSV = () => {
    const csvData = generateCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger the download
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `User-Management-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* User Management Title and Search Functionality */}
      <div className="mb-6">
        <h1 className='text-2xl font-bold text-gray-800 mb-4'>User Management</h1>
        
        {/* Search, Filters, and User Count in a single row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className='text-sm text-gray-500 whitespace-nowrap'>
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </div>
          
          <div className="flex-1 flex flex-wrap items-center gap-2 mx-2 min-w-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BsSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email"
                value={inputSearchTerm}
                onChange={(e) => {
                  setInputSearchTerm(e.target.value);
                  if (e.target.value === '') {
                    setTimeout(() => handleSearch(), 100);
                  }
                }}
                className="pl-8 w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            
            <select
              value={inputAccessLevelFilter}
              onChange={(e) => {
                setInputAccessLevelFilter(e.target.value);
                setTimeout(() => handleSearch(), 100);
              }}
              className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">All Access Levels</option>
              <option value="Administrator">Administrator</option>
              <option value="Staff Member">Staff Member</option>
            </select>
            
            <select
              value={inputStatusFilter}
              onChange={(e) => {
                setInputStatusFilter(e.target.value);
                setTimeout(() => handleSearch(), 100);
              }}
              className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-3 py-1.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none whitespace-nowrap"
            >
              Search
            </button>
            
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none whitespace-nowrap"
            >
              Clear
            </button>
          </div>
          
          <button
            onClick={downloadCSV}
            className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none flex items-center whitespace-nowrap"
          >
            <BsDownload className="mr-1" /> Export to CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Access Level
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.accessLevel}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.accessLevel === 'Staff Member' ? (
                    <div>
                      {user.permissions && user.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.map((permission, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {permission}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No permissions</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      All permissions
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => onViewDetails(user)}
                      title="View user details"
                    >
                      <BsInfoCircle className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Display "No users found" message when filters return empty results */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No users found matching your search criteria</p>
          <button
            onClick={clearFilters}
            className="mt-2 text-sky-600 hover:text-sky-800 underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
};

export default UserTable;