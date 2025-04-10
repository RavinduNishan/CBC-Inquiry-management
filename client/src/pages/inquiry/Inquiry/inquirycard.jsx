import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiTag, FiMessageSquare, FiFile, FiClock, FiRefreshCw, FiSend, FiUserPlus, FiHash } from 'react-icons/fi';
import { BsSearch, BsDownload, BsFilePdf } from 'react-icons/bs';
import AssignUserModal from './AssignUserModal';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    return date.toLocaleString('en-IN', options);
};

const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const priorityStyles = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-orange-100 text-orange-800 border-orange-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
};

const InquiryCard = ({ inquiries, onRespond, onInquiriesUpdated, hideAssignButton = false }) => {
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

    // Export PDF function
    const exportToPDF = () => {
        const doc = new jsPDF();
        const titleText = `Inquiry Report - ${new Date().toLocaleDateString()}`;
        
        // Add title
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(titleText, 14, 22);
        
        // Add filter info
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        let yPos = 30;
        
        if (searchTerm) {
            doc.text(`Search: "${searchTerm}"`, 14, yPos);
            yPos += 6;
        }
        if (priorityFilter) {
            doc.text(`Priority: ${priorityFilter}`, 14, yPos);
            yPos += 6;
        }
        if (statusFilter) {
            doc.text(`Status: ${statusFilter}`, 14, yPos);
            yPos += 6;
        }
        if (dateFrom || dateTo) {
            const dateLabel = dateField === 'createdAt' ? 'Creation Date' : 'Update Date';
            const dateRangeText = `${dateLabel}: ${dateFrom || 'Any'} to ${dateTo || 'Any'}`;
            doc.text(dateRangeText, 14, yPos);
            yPos += 6;
        }
        
        doc.setDrawColor(220, 220, 220);
        doc.line(14, yPos, 196, yPos);
        yPos += 10;
        
        // For each filtered inquiry, add a section
        filteredInquiries.forEach((inquiry, index) => {
            // Check if we need a new page
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            // Inquiry header
            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text(`${index + 1}. ${inquiry.subject || 'No Subject'}`, 14, yPos);
            yPos += 8;
            
            // Inquiry details
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            
            doc.text(`ID: ${inquiry.inquiryID}`, 14, yPos);
            doc.text(`Status: ${inquiry.status}`, 80, yPos);
            doc.text(`Priority: ${inquiry.priority}`, 140, yPos);
            yPos += 6;
            
            doc.text(`From: ${inquiry.name}`, 14, yPos);
            doc.text(`Company: ${inquiry.company}`, 80, yPos);
            doc.text(`Category: ${inquiry.category}`, 140, yPos);
            yPos += 6;
            
            doc.text(`Email: ${inquiry.email}`, 14, yPos);
            doc.text(`Phone: ${inquiry.phone}`, 80, yPos);
            yPos += 6;
            
            const assignedName = inquiry.assigned?.name || 'Unassigned';
            doc.text(`Assigned to: ${assignedName}`, 14, yPos);
            doc.text(`Created by: ${inquiry.createdBy || 'Unknown'}`, 80, yPos);
            yPos += 6;
            
            doc.text(`Created: ${formatDate(inquiry.createdAt)}`, 14, yPos);
            doc.text(`Updated: ${formatDate(inquiry.updatedAt)}`, 80, yPos);
            yPos += 8;
            
            // Message content
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            doc.text('Message:', 14, yPos);
            yPos += 5;
            
            // Handle multiline message text with word wrapping
            const messageLines = doc.splitTextToSize(inquiry.message || 'No message content', 180);
            doc.text(messageLines, 14, yPos);
            yPos += messageLines.length * 5 + 5;
            
            // Comments if any
            if (inquiry.comments) {
                doc.text('Comments:', 14, yPos);
                yPos += 5;
                const commentLines = doc.splitTextToSize(inquiry.comments, 180);
                doc.text(commentLines, 14, yPos);
                yPos += commentLines.length * 5 + 5;
            }
            
            // Add separator between inquiries
            doc.setDrawColor(200, 200, 200);
            doc.line(14, yPos, 196, yPos);
            yPos += 10;
        });
        
        // Add summary at the end
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text(`Total Inquiries: ${filteredInquiries.length}`, 14, yPos);
        
        // Save the PDF
        doc.save(`Inquiry-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const handleAssignClick = (inquiry) => {
        // Don't process if the inquiry is closed
        if (inquiry.status.toLowerCase() === 'closed') return;
        
        setCurrentInquiryId(inquiry._id);
        // Set current assignee from the updated structure
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
            {/* Search and Filter Controls */}
            <div className="mb-6">
            <div className='text-sm text-gray-500 whitespace-nowrap'>
                        {filteredInquiries.length} {filteredInquiries.length === 1 ? 'inquiry' : 'inquiries'} found
                    </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    
                    
                    <div className="flex-1 mx-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Basic Search Input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <BsSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search (name, email, company, subject)"
                                    value={inputSearchTerm}
                                    onChange={(e) => setInputSearchTerm(e.target.value)}
                                    className="pl-8 w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                            </div>
                            
                            {/* Filter Dropdowns - First Row */}
                            <div className="flex space-x-2">
                                <select
                                    value={inputPriorityFilter}
                                    onChange={(e) => setInputPriorityFilter(e.target.value)}
                                    className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                                
                                <select
                                    value={inputStatusFilter}
                                    onChange={(e) => setInputStatusFilter(e.target.value)}
                                    className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            
                            {/* Assigned To Filter */}
                            <select
                                value={inputAssignedFilter}
                                onChange={(e) => setInputAssignedFilter(e.target.value)}
                                className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                            >
                                <option value="">Assigned To (Any)</option>
                                <option value="unassigned">Not Assigned</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Second Row of Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            {/* Date Range Filters */}
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                    <select
                                        value={inputDateField}
                                        onChange={(e) => setInputDateField(e.target.value)}
                                        className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    >
                                        <option value="createdAt">Created Date</option>
                                        <option value="updatedAt">Updated Date</option>
                                    </select>
                                    <span className="text-sm text-gray-500">From</span>
                                    <input
                                        type="date"
                                        value={inputDateFrom}
                                        onChange={(e) => setInputDateFrom(e.target.value)}
                                        className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    />
                                    <span className="text-sm text-gray-500">To</span>
                                    <input
                                        type="date"
                                        value={inputDateTo}
                                        onChange={(e) => setInputDateTo(e.target.value)}
                                        className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    />
                                </div>
                            </div>
                            
                            {/* Inquiry ID Range */}
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                    <span className="text-sm text-gray-500">Inquiry ID From</span>
                                    <input
                                        type="text"
                                        placeholder="Starting ID"
                                        value={inputInquiryIdFrom}
                                        onChange={(e) => setInputInquiryIdFrom(e.target.value)}
                                        className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    />
                                    <span className="text-sm text-gray-500">To</span>
                                    <input
                                        type="text"
                                        placeholder="Ending ID"
                                        value={inputInquiryIdTo}
                                        onChange={(e) => setInputInquiryIdTo(e.target.value)}
                                        className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Search Buttons */}
                        <div className="flex justify-end space-x-2 mt-3">
                            <button
                                onClick={handleSearch}
                                className="px-4 py-1.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none"
                            >
                                <BsSearch className="inline mr-1" /> Search
                            </button>
                            
                            <button
                                onClick={clearFilters}
                                className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
                            >
                                Clear
                            </button>
                            
                            <button
                                onClick={exportToPDF}
                                className="px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none flex items-center"
                            >
                                <BsFilePdf className="mr-1" /> Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inquiry Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {filteredInquiries.map((inquiry) => (
                    <div key={inquiry._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                                        <FiHash className="mr-1 text-blue-500" />
                                        Inquiry ID: {inquiry.inquiryID}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                        <FiUser className="mr-2 text-blue-500" />
                                        {inquiry.name}
                                    </h3>
                                    <div className="flex items-center mt-1 text-sm text-gray-600">
                                        <FiMail className="mr-1.5" />
                                        {inquiry.email}
                                    </div>
                                    <div className="flex items-center mt-1 text-sm text-gray-600">
                                        <FiPhone className="mr-1.5" />
                                        {inquiry.phone}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyles[inquiry.status]}`}>
                                        {inquiry.status}
                                    </span>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${priorityStyles[inquiry.priority]}`}>
                                        {inquiry.priority} priority
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                            {/* Timestamps */}
                            <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3 mb-4">
                                <div className="flex items-center text-xs text-gray-600">
                                    <FiClock className="mr-1.5 text-blue-400" />
                                    Created: {formatDate(inquiry.createdAt)}
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                    <FiRefreshCw className="mr-1.5 text-blue-400" />
                                    Updated: {formatDate(inquiry.updatedAt)}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-start">
                                    <FiBriefcase className="mt-1 mr-2 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Company</p>
                                        <p className="text-sm text-gray-700">{inquiry.company}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FiTag className="mt-1 mr-2 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Category</p>
                                        <p className="text-sm text-gray-700">{inquiry.category}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FiMessageSquare className="mt-1 mr-2 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Subject</p>
                                        <p className="text-sm text-gray-700 font-medium">{inquiry.subject}</p>
                                    </div>
                                </div>

                                {inquiry.attachments?.length > 0 && (
                                    <div className="flex items-start">
                                        <FiFile className="mt-1 mr-2 text-blue-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Attachments</p>
                                            <div className="text-sm text-gray-700 space-y-1">
                                                {inquiry.attachments.map((file, index) => (
                                                    <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block truncate">
                                                        {file.split('/').pop()}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start">
                                    <FiMessageSquare className="mt-1 mr-2 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Message</p>
                                        <p className="text-sm text-gray-700">
                                            {inquiry.message.length > 120 
                                                ? `${inquiry.message.substring(0, 120)}...` 
                                                : inquiry.message}
                                            {inquiry.message.length > 120 && (
                                                <Link to={`/inquiries/${inquiry._id}`} className="text-blue-500 hover:underline ml-1">
                                                    Read more
                                                </Link>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {inquiry.comments && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r">
                                        <p className="text-xs font-semibold text-yellow-800 uppercase">Comments</p>
                                        <p className="text-sm text-yellow-700">{inquiry.comments}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                            <div>
                                {inquiry.assigned && inquiry.assigned.name && (
                                    <div className="text-xs text-gray-600">
                                        <span className="font-medium">Assigned to:</span> {inquiry.assigned.name}
                                    </div>
                                )}
                                <div className="text-xs text-gray-600">
                                    <span className="font-medium">Created by:</span> {inquiry.createdBy}
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                {!hideAssignButton && (
                                    <button
                                        onClick={() => handleAssignClick(inquiry)}
                                        className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md ${
                                            inquiry.status.toLowerCase() === 'closed'
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                            : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
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
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <FiSend className="mr-1" />
                                        Respond
                                    </button>
                                ) : (
                                    <Link to={`/inquiry/response/${inquiry._id}`} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        <FiSend className="mr-1" />Respond
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
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

export default InquiryCard;