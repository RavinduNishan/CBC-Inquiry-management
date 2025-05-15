import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiTag, FiMessageSquare, FiFile, FiClock, FiRefreshCw, FiSend, FiUserPlus, FiHash } from 'react-icons/fi';
import { BsSearch, BsDownload, BsFilePdf } from 'react-icons/bs';
import AssignUserModal from './AssignUserModal';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import AuthContext from '../../context/AuthContext';

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
    'in progress': 'bg-blue-100 text-blue-800 border-blue-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const priorityStyles = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    urgent: 'bg-red-200 text-red-900 border-red-300'
};

const InquiryCard = ({ inquiries, onRespond, onInquiriesUpdated, hideAssignButton = false }) => {
    const { user } = useContext(AuthContext);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [currentInquiryId, setCurrentInquiryId] = useState(null);
    const [currentAssignee, setCurrentAssignee] = useState(null);
    const [currentInquiryDepartment, setCurrentInquiryDepartment] = useState(null);
    const [users, setUsers] = useState([]);

    // Simple check - only admins can fetch all users
    const isAdmin = user?.isAdmin === true; // Strict check for true

    // Add proper check for assignment permission
    const canUserAssign = user?.accessLevel === 'admin' || user?.accessLevel === 'manager' || !hideAssignButton;

    // Check if user is staff
    const isStaffUser = user?.accessLevel === 'staff';

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
        // Only attempt to fetch users if user is admin
        if (isAdmin) {
            const fetchUsers = async () => {
                try {
                    const response = await axios.get('http://localhost:5555/user');
                    setUsers(response.data.data);
                } catch (error) {
                    console.log('Error fetching users for filter - handled gracefully');
                    setUsers([]);
                }
            };
            fetchUsers();
        } else {
            // For non-admins, don't even try to fetch
            console.log('Non-admin user, skipping user fetch request in InquiryCard');
            setUsers([]);
        }
    }, [isAdmin]);

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
            // Text search (client info, subject, message)
            const matchesSearchTerm = !inputSearchTerm || 
                inquiry.client?.name?.toLowerCase().includes(inputSearchTerm.toLowerCase()) ||
                inquiry.client?.email?.toLowerCase().includes(inputSearchTerm.toLowerCase()) ||
                inquiry.client?.department?.toLowerCase().includes(inputSearchTerm.toLowerCase()) ||
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
            
            // Get client information safely
            const clientName = inquiry.client?.name || 'N/A';
            const clientEmail = inquiry.client?.email || 'N/A';
            const clientPhone = inquiry.client?.phone || 'N/A';
            const clientDepartment = inquiry.client?.department || 'N/A';
            
            // Inquiry details
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            
            doc.text(`ID: ${inquiry.inquiryID}`, 14, yPos);
            doc.text(`Status: ${inquiry.status}`, 80, yPos);
            doc.text(`Priority: ${inquiry.priority}`, 140, yPos);
            yPos += 6;
            
            doc.text(`Client: ${clientName}`, 14, yPos);
            doc.text(`Department: ${clientDepartment}`, 80, yPos);
            doc.text(`Category: ${inquiry.category}`, 140, yPos);
            yPos += 6;
            
            doc.text(`Email: ${clientEmail}`, 14, yPos);
            doc.text(`Phone: ${clientPhone}`, 80, yPos);
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
        // Don't process if the inquiry is closed or user can't assign
        if (inquiry.status.toLowerCase() === 'closed' || !canUserAssign) return;
        
        setCurrentInquiryId(inquiry._id);
        setCurrentAssignee(inquiry.assigned?.userId || null);
        
        // Set the department of the selected inquiry for filtering users
        setCurrentInquiryDepartment(inquiry.client?.department || user?.department);
        
        setAssignModalOpen(true);
    };

    const handleAssignModalClose = (refreshNeeded) => {
        setAssignModalOpen(false);
        if (refreshNeeded && onInquiriesUpdated) {
            onInquiriesUpdated();
        }
    };

    const renderCard = (inquiry) => {
        return (
            <div key={inquiry._id} className={`bg-white rounded-lg border-2 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`}>
                {/* Card Header */}
                <div className="bg-gradient-to-r from-sky-50 to-gray-50 px-3 py-2 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div className="w-3/4">
                            {/* Client name more prominently displayed */}
                            <h3 className="text-base font-bold text-sky-700 flex items-center mb-1">
                                <FiBriefcase className="mr-1 text-sky-500 flex-shrink-0" />
                                {inquiry.client?.name || 'Unknown'}
                            </h3>
                            {/* Inquiry ID and contact smaller */}
                            <div className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                                <FiHash className="mr-1 text-gray-400" />
                                {inquiry.inquiryID}
                            </div>
                            <div className="text-xs text-gray-600">
                                <FiUser className="inline mr-1" />
                                {inquiry.client?.department || 'No department'}
                            </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusStyles[inquiry.status.toLowerCase()]}`}>
                                {inquiry.status}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${priorityStyles[inquiry.priority.toLowerCase()]}`}>
                                {inquiry.priority}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card Body - more compact */}
                <div className="p-3">
                    {/* Subject line */}
                    <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Subject</p>
                        <p className="text-sm font-medium">{inquiry.subject}</p>
                    </div>
                    
                    {/* Contact info row */}
                    <div className="flex justify-between mb-2 text-xs">
                        <div className="flex items-center">
                            <FiMail className="mr-1 text-gray-400" />
                            <span className="truncate max-w-[140px]">{inquiry.client?.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center">
                            <FiPhone className="mr-1 text-gray-400" />
                            <span>{inquiry.client?.phone || 'No phone'}</span>
                        </div>
                    </div>
                    
                    {/* Category */}
                    <div className="mb-2">
                        <p className="text-xs text-gray-500">
                            <FiTag className="inline mr-1 text-sky-500" />
                            {inquiry.category}
                        </p>
                    </div>

                    {/* Message content */}
                    <div className="mb-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Message</div>
                        <p className="text-xs text-gray-700 line-clamp-2">
                            {inquiry.message.length > 80 
                                ? `${inquiry.message.substring(0, 80)}...` 
                                : inquiry.message}
                        </p>
                    </div>

                    {/* Dates row */}
                    <div className="text-xs text-gray-500 mb-2 flex justify-between">
                        <span>
                            <FiClock className="inline mr-1" />
                            {formatDate(inquiry.createdAt).split(',')[0]}
                        </span>
                        {inquiry.comments && (
                            <span className="italic">
                                {Array.isArray(inquiry.comments)
                                    ? inquiry.comments.length > 0
                                        ? inquiry.comments[0].text.length > 20 
                                            ? `${inquiry.comments[0].text.substring(0, 20)}...` 
                                            : inquiry.comments[0].text
                                        : ""
                                    : inquiry.comments.length > 20 
                                        ? `${inquiry.comments.substring(0, 20)}...` 
                                        : inquiry.comments}
                            </span>
                        )}
                    </div>
                </div>

                {/* Only show footer with action buttons if user is not staff */}
                {!isStaffUser && (
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                            {inquiry.assigned && inquiry.assigned.name ? (
                                <span>Assigned: {inquiry.assigned.name.split(' ')[0]}</span>
                            ) : (
                                <span className="italic text-gray-400">Unassigned</span>
                            )}
                        </div>
                        <div className="flex space-x-1">
                            {!hideAssignButton && canUserAssign && (
                                <button
                                    onClick={() => handleAssignClick(inquiry)}
                                    className={`inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md ${
                                        inquiry.status.toLowerCase() === 'closed'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                        : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none'
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
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none"
                                >
                                    <FiSend className="mr-1" />
                                    Respond
                                </button>
                            ) : (
                                <Link to={`/inquiry/response/${inquiry._id}`} className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none">
                                    <FiSend className="mr-1" />
                                    Respond
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Show a simplified footer for staff users with just details button */}
                {isStaffUser && (
                    <div className="border-t border-gray-100 bg-white px-4 py-3 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                            {formatDate(inquiry.updatedAt)}
                        </span>
                        <div className="flex space-x-2">
                            {/* Only View details button */}
                            <button
                                onClick={() => handleViewDetails(inquiry)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                            >
                                <FiEye className="mr-1.5" />
                                Details
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Sticky Search and Filter Controls with improved styling */}
            <div className="mb-4 sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm pt-2 pb-3 px-1 -mx-1 shadow-md">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2 items-end">
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
                        <div className="flex space-x-1 flex-wrap col-span-1">
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
                            
                            {isAdmin ? (
                                <select
                                    value={inputAssignedFilter}
                                    onChange={(e) => setInputAssignedFilter(e.target.value)}
                                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                                >
                                    <option value="">Assigned To</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>{user.name}</option>
                                    ))}
                                    <option value="unassigned">Unassigned</option>
                                </select>
                            ) : (
                                <select
                                    value={inputAssignedFilter}
                                    onChange={(e) => setInputAssignedFilter(e.target.value)}
                                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                                >
                                    <option value="">Assigned To</option>
                                    <option value="assigned">Any Assigned</option>
                                    <option value="unassigned">Unassigned</option>
                                    {user && (
                                        <option value={user._id}>Assigned to me</option>
                                    )}
                                </select>
                            )}
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
                                onClick={exportToPDF}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none text-sm font-medium flex items-center"
                            >
                                <BsFilePdf className="mr-1" /> PDF
                            </button>
                        </div>
                    </div>
                    
                    {/* Secondary Filters Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Date Range Filters */}
                        <div className="flex items-center space-x-1 text-sm">
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
                        
                        {/* ID Range and Counter */}
                        <div className="flex items-center text-sm justify-between">
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
                            
                            <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                    {filteredInquiries.length}
                                </span> inquiries found
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inquiry Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
                {filteredInquiries.map(renderCard)}
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

            {/* Don't render the modal for staff users */}
            {!isStaffUser && (
                <AssignUserModal
                    isOpen={assignModalOpen}
                    onClose={handleAssignModalClose}
                    inquiryId={currentInquiryId}
                    currentAssignee={currentAssignee}
                    inquiryDepartment={currentInquiryDepartment}
                />
            )}
        </>
    );
};

export default InquiryCard;