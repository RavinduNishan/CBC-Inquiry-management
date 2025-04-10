import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { FiSend, FiUserPlus } from 'react-icons/fi';
import AssignUserModal from './AssignUserModal';

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
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm relative">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquiry ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-l z-10">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inquiries.map((inquiry) => (
              <tr key={inquiry._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {inquiry.inquiryID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">{inquiry.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                      <div className="text-sm text-gray-500">{inquiry.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {inquiry.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inquiry.company}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {inquiry.subject}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {inquiry.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {priorityBadge(inquiry.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {inquiry.assigned && inquiry.assigned.name ? (
                    <span className="font-medium text-blue-600">{inquiry.assigned.name}</span>
                  ) : (
                    <span className="text-gray-400 italic">Unassigned</span>
                  )}
                  {inquiry.assigned && inquiry.assigned.userId && (
                    <span className="hidden">ID: {inquiry.assigned.userId}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(inquiry.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {statusBadge(inquiry.status)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {inquiry.message}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {inquiry.comments}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(inquiry.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white shadow-l z-10 border-l border-gray-100">
                  <div className="flex justify-end space-x-2">
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
                      <Link
                        to={`/inquiry/response/${inquiry._id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiSend className="mr-1" />
                        Respond
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default InquiryTable;