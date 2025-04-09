import React from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiBriefcase, FiTag, FiMessageSquare, FiHash } from 'react-icons/fi';

const InquiryModal = ({ inquiry, isOpen, onClose }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getPriorityClass = (priority) => {
    switch(priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{inquiry.subject}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <div className="text-sm font-medium text-gray-500 px-3 py-1 bg-gray-100 rounded-lg flex items-center">
              <FiHash className="mr-1" />
              ID: {inquiry.inquiryID}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityClass(inquiry.priority)}`}>
              {inquiry.priority} Priority
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(inquiry.status)}`}>
              {inquiry.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div>
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <FiUser className="mr-1" /> Contact Information
                </div>
                <p className="font-medium">{inquiry.name}</p>
                <p className="text-sm flex items-center"><FiMail className="mr-1" /> {inquiry.email}</p>
                <p className="text-sm flex items-center"><FiPhone className="mr-1" /> {inquiry.phone}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <FiBriefcase className="mr-1" /> Company
                </div>
                <p>{inquiry.company}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <FiTag className="mr-1" /> Category
                </div>
                <p>{inquiry.category}</p>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Created</div>
                <p>{formatDate(inquiry.createdAt)}</p>
                <p className="text-sm">By: {inquiry.createdBy}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <FiMessageSquare className="mr-1" /> Message
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap">
              {inquiry.message}
            </div>
          </div>

          {inquiry.comments && (
            <div className="mb-6">
              <div className="text-gray-500 text-sm mb-2">Comments</div>
              <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200 whitespace-pre-wrap">
                {inquiry.comments}
              </div>
            </div>
          )}

          {inquiry.assigned && inquiry.assigned.name && (
            <div className="border-t pt-4">
              <div className="text-gray-500 text-sm mb-1">Assigned To</div>
              <p className="font-medium">{inquiry.assigned.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryModal;
