import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiTag, FiMessageSquare, FiFile, FiClock, FiRefreshCw, FiSend, FiUserPlus, FiHash } from 'react-icons/fi';
import AssignUserModal from './AssignUserModal';

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {inquiries.map((inquiry) => (
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