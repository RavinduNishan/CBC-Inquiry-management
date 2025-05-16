import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { BsSearch, BsDownload, BsFilter, BsCalendarDate } from 'react-icons/bs';
import { FiClock, FiUser, FiBriefcase, FiInfo, FiWifi, FiActivity, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format } from 'date-fns';

// Try-catch block for DatePicker import - this can be removed if you properly install react-datepicker
let DatePicker;
try {
  DatePicker = require('react-datepicker').default;
  require('react-datepicker/dist/react-datepicker.css');
} catch (error) {
  // Fallback component if DatePicker is not available
  DatePicker = ({ selected, onChange, selectsStart, selectsEnd, startDate, endDate, minDate, dateFormat, className, placeholderText }) => (
    <input
      type="date"
      value={selected ? format(selected, dateFormat || 'yyyy-MM-dd') : ''}
      onChange={(e) => onChange(new Date(e.target.value))}
      placeholder={placeholderText || 'Select date...'}
      className={className}
    />
  );
}

const UserLogsTable = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  
  // Search and filter state
  const [inputSearchTerm, setInputSearchTerm] = useState('');
  const [inputDepartmentFilter, setInputDepartmentFilter] = useState('');
  const [inputDateFrom, setInputDateFrom] = useState('');
  const [inputDateTo, setInputDateTo] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Applied filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  
  // Fetch logs with current filters and pagination
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        department: departmentFilter || undefined
      };
      
      // Add date range if set
      if (dateFrom) {
        params.startDate = dateFrom.toISOString();
      }
      if (dateTo) {
        params.endDate = dateTo.toISOString();
      }
      
      const response = await axios.get('http://localhost:5555/userlog', { params });
      
      setLogs(response.data.data || []);
      setPagination({
        ...pagination,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
        page: response.data.currentPage || 1
      });
    } catch (error) {
      console.error('Error fetching user logs:', error);
      enqueueSnackbar('Failed to fetch user logs', { variant: 'error' });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Load logs on initial render and when filters/pagination change
  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.limit, searchTerm, departmentFilter, dateFrom, dateTo]);
  
  // Handle search form submission
  const handleSearch = (e) => {
    e && e.preventDefault();
    
    setSearchTerm(inputSearchTerm);
    setDepartmentFilter(inputDepartmentFilter);
    
    // Parse dates from inputs
    const fromDate = inputDateFrom ? new Date(inputDateFrom) : null;
    const toDate = inputDateTo ? new Date(inputDateTo) : null;
    
    if (toDate) toDate.setHours(23, 59, 59, 999);
    
    setDateFrom(fromDate);
    setDateTo(toDate);
    
    // Reset to first page when applying new filters
    setPagination({
      ...pagination,
      page: 1
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setInputSearchTerm('');
    setInputDepartmentFilter('');
    setInputDateFrom('');
    setInputDateTo('');
    
    setSearchTerm('');
    setDepartmentFilter('');
    setDateFrom(null);
    setDateTo(null);
    
    // Reset to first page
    setPagination({
      ...pagination,
      page: 1
    });
  };
  
  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination({
      ...pagination,
      page: newPage
    });
  };
  
  // Generate CSV data from logs
  const generateCSV = () => {
    // Define the headers
    const headers = [
      'Date', 'Time', 'MAC Address', 'User Email', 'Department', 'Description'
    ];
    
    // Create the CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data for each log
    logs.forEach(log => {
      const date = new Date(log.createdAt);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const formattedTime = format(date, 'HH:mm:ss');
      
      // Escape values that might contain commas
      const row = [
        `"${formattedDate}"`,
        `"${formattedTime}"`,
        `"${log.macAddress || ''}"`,
        `"${log.userEmail || ''}"`,
        `"${log.department || ''}"`,
        `"${(log.description || '').replace(/"/g, '""')}"`  // Fixed: removed extra quotes
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
    link.setAttribute('download', `User-Logs-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header section similar to inquiry table */}
      
      
      {/* Search and filter section styled like inquiry table */}
      <div className="sticky top-14 z-30 bg-white backdrop-blur-sm shadow-md">
        <div className="bg-white rounded-t-lg border border-gray-200 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 items-end">
            {/* Search Input */}
            <div className="relative col-span-1">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <BsSearch className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search logs..."
                value={inputSearchTerm}
                onChange={(e) => setInputSearchTerm(e.target.value)}
                className="pl-8 w-full py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            
            {/* Department Filter */}
            <div className="flex space-x-1 flex-wrap">
              <select
                value={inputDepartmentFilter}
                onChange={(e) => setInputDepartmentFilter(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">All Departments</option>
                <option value="CBC">CBC</option>
                <option value="CBI">CBI</option>
                <option value="M~Line">M~Line</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-1">
              <button
                onClick={handleSearch}
                className="px-3 py-1.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none text-sm font-medium flex items-center"
              >
                <BsSearch className="mr-1" /> Search
              </button>
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none text-sm font-medium"
              >
                Clear
              </button>
              <button
                onClick={downloadCSV}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none text-sm font-medium flex items-center"
              >
                <BsDownload className="mr-1" /> CSV
              </button>
            </div>
          </div>
          
          {/* Date range filters */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 mr-1">Date Range:</span>
              <input
                type="date"
                value={inputDateFrom}
                onChange={(e) => setInputDateFrom(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={inputDateTo}
                onChange={(e) => setInputDateTo(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
              />
            </div>
            <div className="mt-3 flex justify-end">
            <div className="text-sm text-gray-500">
              Showing {logs.length} of {pagination.total} logs
            </div>
          </div>
          </div>
          {/* Showing logs count - moved to bottom of filters */}
          
        </div>
      </div>
      
      {/* Table section */}
      <div className="flex-1 overflow-auto border border-t-0 border-gray-200 rounded-b-lg bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No logs found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <FiClock className="mr-1" /> Date & Time
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <FiWifi className="mr-1" /> MAC Address
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <FiUser className="mr-1" /> User Email
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <FiBriefcase className="mr-1" /> Department
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <FiInfo className="mr-1" /> Description
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(log.createdAt), 'yyyy-MM-dd')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(log.createdAt), 'HH:mm:ss')}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{log.macAddress}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.userEmail}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      bg-blue-100 text-blue-800">
                      {log.department}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{log.description}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination - styled like inquiry table but at the bottom */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center py-3 bg-white border-t border-gray-200">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            <FiChevronLeft />
          </button>
          
          <span className="text-sm text-gray-600 mx-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserLogsTable;
