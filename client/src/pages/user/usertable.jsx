import React, { useState, useEffect } from 'react';
import { BsInfoCircle, BsSearch } from 'react-icons/bs';
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
    e.preventDefault();
    
    // Update the actual filter values from the input values
    setSearchTerm(inputSearchTerm);
    setAccessLevelFilter(inputAccessLevelFilter);
    setStatusFilter(inputStatusFilter);
    
    // Apply filters
    applyFilters(inputSearchTerm, inputAccessLevelFilter, inputStatusFilter);
  };

  // Apply the filters to the users array
  const applyFilters = (search, accessLevel, status) => {
    let result = [...users];
    
    // Filter by search term (name or email)
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Filter by access level
    if (accessLevel) {
      result = result.filter(user => user.accessLevel === accessLevel);
    }
    
    // Filter by status
    if (status) {
      result = result.filter(user => user.status === status);
    }
    
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

  return (
    <>
      {/* Search and Filter Section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BsSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email"
                value={inputSearchTerm}
                onChange={(e) => setInputSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            
            {/* Access Level Filter */}
            <div>
              <select
                value={inputAccessLevelFilter}
                onChange={(e) => setInputAccessLevelFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">All Access Levels</option>
                <option value="Administrator">Administrator</option>
                <option value="Staff Member">Staff Member</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                value={inputStatusFilter}
                onChange={(e) => setInputStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear
              </button>
            </div>
          </div>
        </form>
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