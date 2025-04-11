import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsInfoCircle, BsSearch, BsDownload } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { FiSend, FiUserPlus, FiCalendar, FiFilter } from 'react-icons/fi';
import AssignUserModal from './AssignUserModal';
import axios from 'axios';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// Format date for input fields
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Status badge component
const statusBadge = (status) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
  switch (status.toLowerCase()) {
    case 'pending':
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{status}</span>;
    case 'completed':
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>{status}</span>;
    case 'in progress':
      return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{status}</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
  }
};

// Priority badge component
const priorityBadge = (priority) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
  switch (priority.toLowerCase()) {
    case 'high':
      return <span className={`${baseClasses} bg-red-100 text-red-800`}>{priority}</span>;
    case 'medium':
      return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>{priority}</span>;
    case 'low':
      return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{priority}</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{priority}</span>;
  }
};

const InquiryTable = ({ inquiries, onRespond, onInquiriesUpdated, hideAssignButton = false }) => {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [currentInquiryId, setCurrentInquiryId] = useState(null);
  const [currentAssignee, setCurrentAssignee] = useState(null);
  const [users, setUsers] = useState([]);

  // Filter input states
  const [inputSearchTerm, setInputSearchTerm] = useState('');
  const [inputPriorityFilter, setInputPriorityFilter] = useState('');
  const [inputStatusFilter, setInputStatusFilter] = useState('');
  const [inputAssignedFilter, setInputAssignedFilter] = useState('');
  const [inputDateFrom, setInputDateFrom] = useState('');
  const [inputDateTo, setInputDateTo] = useState('');
  const [inputDateField, setInputDateField] = useState('createdAt');
  const [inputInquiryIdFrom, setInputInquiryIdFrom] = useState('');
  const [inputInquiryIdTo, setInputInquiryIdTo] = useState('');

  // Applied filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dateField, setDateField] = useState('createdAt');
  const [inquiryIdFrom, setInquiryIdFrom] = useState('');
  const [inquiryIdTo, setInquiryIdTo] = useState('');

  // Filtered inquiries
  const [filteredInquiries, setFilteredInquiries] = useState([]);

  // Fetch users for assignment filter
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5555/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching users for filter:', error);
      }
    };
    fetchUsers();
  }, []);

  // Initialize filtered inquiries with all inquiries on component mount
  useEffect(() => {
    setFilteredInquiries(inquiries);
  }, [inquiries]);

  // Handle search button click
  const handleSearch = (e) => {
    e && e.preventDefault();
    
    // Update the actual filter values from the input values
    setSearchTerm(inputSearchTerm);
    setPriorityFilter(inputPriorityFilter);
    setStatusFilter(inputStatusFilter);
    setAssignedFilter(inputAssignedFilter);
    setDateFrom(inputDateFrom);
    setDateTo(inputDateTo);
    setDateField(inputDateField);
    setInquiryIdFrom(inputInquiryIdFrom);
    setInquiryIdTo(inputInquiryIdTo);
    
    console.log("Search criteria:", {
      searchTerm: inputSearchTerm,
      priority: inputPriorityFilter,
      status: inputStatusFilter,
      assigned: inputAssignedFilter,
      dateField: inputDateField,
      dateFrom: inputDateFrom,
      dateTo: inputDateTo,
      inquiryIdFrom: inputInquiryIdFrom,
      inquiryIdTo: inputInquiryIdTo
    });
    
    // Apply filters
    const result = inquiries.filter(inquiry => {
      // Text search (name, email, company, subject, message)
      const matchesSearchTerm = !inputSearchTerm || 
        inquiry.name?.toLowerCase().includes(inputSearchTerm.toLowerCase()) ||
        inquiry.email?.toLowerCase().includes(inputSearchTerm.toLowerCase()) ||
        inquiry.company?.toLowerCase().includes(inputSearchTerm.toLowerCase()) ||
        inquiry.subject?.toLowerCase().includes(inputSearchTerm.toLowerCase()) ||
        inquiry.message?.toLowerCase().includes(inputSearchTerm.toLowerCase());
      
      // Priority filter
      const matchesPriority = !inputPriorityFilter || inquiry.priority?.toLowerCase() === inputPriorityFilter.toLowerCase();
      
      // Status filter
      const matchesStatus = !inputStatusFilter || inquiry.status?.toLowerCase() === inputStatusFilter.toLowerCase();
      
      // Assignment filter
      const matchesAssigned = !inputAssignedFilter || 
        (inputAssignedFilter === 'unassigned' && (!inquiry.assigned || !inquiry.assigned.userId)) ||
        (inputAssignedFilter !== 'unassigned' && inquiry.assigned?.userId === inputAssignedFilter);
      
      // Date range filter - FIXED
      let matchesDateRange = true;
      if (inputDateFrom || inputDateTo) {
        try {
          // Make sure we have a valid date field to filter on
          if (inquiry[inputDateField]) {
            const inquiryDate = new Date(inquiry[inputDateField]);
            
            if (inputDateFrom) {
              const fromDate = new Date(inputDateFrom);
              fromDate.setHours(0, 0, 0, 0);
              matchesDateRange = matchesDateRange && inquiryDate >= fromDate;
            }
            
            if (inputDateTo) {
              const toDate = new Date(inputDateTo);
              toDate.setHours(23, 59, 59, 999);
              matchesDateRange = matchesDateRange && inquiryDate <= toDate;
            }
            
            // Debug log for date comparison
            if (!matchesDateRange && (inputDateFrom || inputDateTo)) {
              console.debug(`Inquiry ${inquiry.inquiryID} date ${inquiryDate} outside of range ${inputDateFrom ? new Date(inputDateFrom) : 'any'} - ${inputDateTo ? new Date(inputDateTo) : 'any'}`);
            }
          } else {
            matchesDateRange = false; // If the date field doesn't exist, don't include it
            console.debug(`Inquiry ${inquiry.inquiryID} missing date field ${inputDateField}`);
          }
        } catch (err) {
          console.error(`Error comparing dates for inquiry ${inquiry.inquiryID}:`, err);
          matchesDateRange = false;
        }
      }
      
      // Inquiry ID range filter - FIXED
      let matchesInquiryIdRange = true;
      if (inputInquiryIdFrom || inputInquiryIdTo) {
        try {
          // Extract numeric part from inquiry ID (assuming format like "2304120001")
          const idText = inquiry.inquiryID || '';
          // Try to extract all digits from the inquiry ID
          const idNumberStr = idText.match(/\d+/g)?.join('') || '';
          const idNumber = idNumberStr ? parseInt(idNumberStr) : 0;
          
          if (inputInquiryIdFrom && idNumber) {
            const fromId = parseInt(inputInquiryIdFrom.replace(/\D/g, ''));
            if (!isNaN(fromId)) {
              matchesInquiryIdRange = matchesInquiryIdRange && idNumber >= fromId;
            }
          }
          
          if (inputInquiryIdTo && idNumber) {
            const toId = parseInt(inputInquiryIdTo.replace(/\D/g, ''));
            if (!isNaN(toId)) {
              matchesInquiryIdRange = matchesInquiryIdRange && idNumber <= toId;
            }
          }
          
          // Debug log for ID comparison
          if (!matchesInquiryIdRange && (inputInquiryIdFrom || inputInquiryIdTo)) {
            console.debug(`Inquiry ${inquiry.inquiryID} ID number ${idNumber} outside of range ${inputInquiryIdFrom || 'any'} - ${inputInquiryIdTo || 'any'}`);
          }
        } catch (err) {
          console.error(`Error comparing IDs for inquiry ${inquiry.inquiryID}:`, err);
          matchesInquiryIdRange = false;
        }
      }
      
      return matchesSearchTerm && matchesPriority && matchesStatus && matchesAssigned && matchesDateRange && matchesInquiryIdRange;
    });
    
    console.log(`Filtered from ${inquiries.length} to ${result.length} inquiries`);
    setFilteredInquiries(result);
  };

  // Clear all filters
  const clearFilters = () => {
    // Clear input values
    setInputSearchTerm('');
    setInputPriorityFilter('');
    setInputStatusFilter('');
    setInputAssignedFilter('');
    setInputDateFrom('');
    setInputDateTo('');
    setInputDateField('createdAt');
    setInputInquiryIdFrom('');
    setInputInquiryIdTo('');
    
    // Clear applied filters
    setSearchTerm('');
    setPriorityFilter('');
    setStatusFilter('');
    setAssignedFilter('');
    setDateFrom('');
    setDateTo('');
    setDateField('createdAt');
    setInquiryIdFrom('');
    setInquiryIdTo('');
    
    // Reset to show all inquiries
    setFilteredInquiries(inquiries);
  };

  // Generate CSV data from filtered inquiries
  const generateCSV = () => {
    // Define the headers
    const headers = [
      'Inquiry ID', 'Name', 'Email', 'Phone', 'Company', 'Subject', 
      'Category', 'Priority', 'Status', 'Message', 'Comments', 
      'Assigned To', 'Created By', 'Created At', 'Updated At'
    ];
    
    // Create the CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data for each inquiry
    filteredInquiries.forEach(inquiry => {
      // Format dates for better readability
      const createdDate = inquiry.createdAt ? formatDate(inquiry.createdAt) : 'N/A';
      const updatedDate = inquiry.updatedAt ? formatDate(inquiry.updatedAt) : 'N/A';
      
      // Format assigned user
      const assignedTo = inquiry.assigned && inquiry.assigned.name ? inquiry.assigned.name : 'Unassigned';
      
      // Create CSV row and escape values that might contain commas
      const row = [
        `"${inquiry.inquiryID || ''}"`,
        `"${inquiry.name || ''}"`,
        `"${inquiry.email || ''}"`,
        `"${inquiry.phone || ''}"`,
        `"${inquiry.company || ''}"`,
        `"${inquiry.subject || ''}"`,
        `"${inquiry.category || ''}"`,
        `"${inquiry.priority || ''}"`,
        `"${inquiry.status || ''}"`,
        `"${(inquiry.message || '').replace(/"/g, '""')}"`,
        `"${(inquiry.comments || '').replace(/"/g, '""')}"`,
        `"${assignedTo}"`,
        `"${inquiry.createdBy || ''}"`,
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
    link.setAttribute('download', `Inquiries-Export-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAssignClick = (inquiry) => {
    // Don't process if the inquiry is closed
    if (inquiry.status.toLowerCase() === 'closed') return;
    
    setCurrentInquiryId(inquiry._id);
    setCurrentAssignee(inquiry.assigned?.userId || null);
    setAssignModalOpen(true);
  };

  const handleAssignModalClose = (refreshNeeded) => {
    setAssignModalOpen(false);
    if (refreshNeeded && onInquiriesUpdated) {
      onInquiriesUpdated();
    }
  };

  return (
    <>
      {/* Sticky Search and Filter Controls - Improve stickiness with backdrop blur */}
      <div className="mb-4 sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm pt-2 pb-3 px-1 -mx-1 shadow-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 items-end">
            {/* Search Input */}
            <div className="relative col-span-1">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <BsSearch className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search inquiries..."
                value={inputSearchTerm}
                onChange={(e) => setInputSearchTerm(e.target.value)}
                className="pl-8 w-full py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            
            {/* Main Filters */}
            <div className="flex space-x-1 flex-wrap">
              <select
                value={inputPriorityFilter}
                onChange={(e) => setInputPriorityFilter(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="urgent">Urgent</option>
              </select>
              
              <select
                value={inputStatusFilter}
                onChange={(e) => setInputStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              
              <select
                value={inputAssignedFilter}
                onChange={(e) => setInputAssignedFilter(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Assigned</option>
                <option value="unassigned">Unassigned</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.name.split(' ')[0]}</option>
                ))}
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
          
          {/* Secondary Filters Row */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {/* Date Range */}
            <div className="flex items-center space-x-1">
              <select
                value={inputDateField}
                onChange={(e) => setInputDateField(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
              >
                <option value="createdAt">Created</option>
                <option value="updatedAt">Updated</option>
              </select>
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
            
            {/* ID Range */}
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-1">ID Range:</span>
              <input
                type="text"
                placeholder="From ID"
                value={inputInquiryIdFrom}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '');
                  setInputInquiryIdFrom(value);
                }}
                maxLength="10"
                pattern="[0-9]*"
                inputMode="numeric"
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm w-24"
              />
              <span className="mx-1 text-xs text-gray-400">-</span>
              <input
                type="text"
                placeholder="To ID"
                value={inputInquiryIdTo}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '');
                  setInputInquiryIdTo(value);
                }}
                maxLength="10"
                pattern="[0-9]*"
                inputMode="numeric"
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm w-24"
              />
            </div>
            
            <div className="ml-auto text-xs text-gray-500 whitespace-nowrap">
              <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-xs font-medium">
                {filteredInquiries.length}
              </span> inquiries found
            </div>
          </div>
        </div>
      </div>

      {/* Modify the table container to properly support sticky headers */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-180px)] rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          {/* Fix table header stickiness */}
          <thead className="bg-gray-50 sticky top-0 z-20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Inquiry ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Coments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Last Update</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 sticky right-0 z-20">Actions</th>
            </tr>
          </thead>
          
          {/* Table body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInquiries.map((inquiry) => {
              // Determine row style based on status and priority
              let rowStyle = '';
              
              if (inquiry.status.toLowerCase() === 'closed') {
                rowStyle = 'bg-gray-100';
              } else {
                switch (inquiry.priority.toLowerCase()) {
                  case 'high':
                  case 'urgent':
                    rowStyle = 'bg-red-50 hover:bg-red-100';
                    break;
                  case 'medium':
                    rowStyle = 'bg-yellow-50 hover:bg-yellow-100';
                    break;
                  case 'low':
                    rowStyle = 'bg-blue-50 hover:bg-blue-100';
                    break;
                  default:
                    rowStyle = 'hover:bg-gray-50';
                }
              }
              
              return (
                <tr key={inquiry._id} className={`transition-colors ${rowStyle}`}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inquiry.inquiryID}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{inquiry.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="ml-3">
                        {/* Company name made more prominent than person name */}
                        <div className="text-sm font-bold text-sky-700">{inquiry.company}</div>
                        <div className="text-xs text-gray-500">{inquiry.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {inquiry.phone}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 max-w-xs truncate">
                    <div className="text-xs">{inquiry.email}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate">
                    {inquiry.subject}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-900 max-w-xs truncate">
                    {inquiry.category}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {priorityBadge(inquiry.priority)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {inquiry.assigned && inquiry.assigned.name ? (
                      <span className="font-medium text-blue-600">{inquiry.assigned.name}</span>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                    {inquiry.assigned && inquiry.assigned.userId && (
                      <span className="hidden">ID: {inquiry.assigned.userId}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {formatDate(inquiry.createdAt)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {statusBadge(inquiry.status)}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-900 max-w-xs truncate">
                    {inquiry.message}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-900 max-w-xs truncate">
                    {inquiry.comments}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {formatDate(inquiry.updatedAt)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium sticky right-0 bg-white shadow-l z-10 border-l border-gray-100">
                    <div className="flex justify-end space-x-1">
                      {!hideAssignButton && (
                        <button
                          onClick={() => handleAssignClick(inquiry)}
                          className={`inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md ${
                            inquiry.status.toLowerCase() === 'closed'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                            : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500'
                          }`}
                          disabled={inquiry.status.toLowerCase() === 'closed'}
                        >
                          <FiUserPlus className="mr-1" />
                          Assign
                        </button>
                      )}
                      {onRespond ? (
                        <button
                          onClick={() => onRespond(inquiry._id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-sky-500"
                        >
                          <FiSend className="mr-1" />
                          Respond
                        </button>
                      ) : (
                        <Link
                          to={`/inquiry/response/${inquiry._id}`}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-sky-500"
                        >
                          <FiSend className="mr-1" />
                          Respond
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Display "No inquiries found" message when filters return empty results */}
      {filteredInquiries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No inquiries found matching your search criteria</p>
          <button
            onClick={clearFilters}
            className="mt-2 text-sky-600 hover:text-sky-800 underline"
          >
            Clear filters
          </button>
        </div>
      )}

      <AssignUserModal
        isOpen={assignModalOpen}
        onClose={handleAssignModalClose}
        inquiryId={currentInquiryId}
        currentAssignee={currentAssignee}
      />
    </>
  );
};

export default InquiryTable;