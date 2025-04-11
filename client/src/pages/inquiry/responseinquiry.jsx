import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../user/Spinner';
import { useSnackbar } from 'notistack';
import { MdPerson, MdEmail, MdPhone, MdBusiness, MdLabel, MdAccessTime, MdMessage, MdOutlineAttachment, MdSave, MdClose, MdFlag } from 'react-icons/md';

const ResponseInquiry = ({ inquiryId: propId, dashboardMode = false }) => {
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mark Johnson' },
    // In a real app, you would fetch this list from your API
  ]);

  const { id: paramId } = useParams();
  const id = propId || paramId;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5555/inquiry/${id}`)
      .then((response) => {
        const inquiryData = response.data;
        setInquiry(inquiryData);
        setComments(inquiryData.comments || '');
        setStatus(inquiryData.status || 'pending');
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching inquiry:', error);
        setLoading(false);
        enqueueSnackbar('Error fetching inquiry details', { variant: 'error' });
      });
  }, [id]);

  

  const handleClose = () => {
    if (inquiry.status === 'closed') return;
    
    setLoading(true);
    axios
      .put(`http://localhost:5555/inquiry/${id}`, { 
        ...inquiry,
        status: 'closed',
        comments 
      })
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Inquiry closed successfully', { variant: 'success' });
        // Navigate based on mode
        if (dashboardMode) {
          // Return to inquiries view in dashboard
          // This will be handled by the parent component
        } else {
          // Navigate back after closing
          navigate('/');
        }
      })
      .catch((error) => {
        console.error('Error closing inquiry:', error);
        setLoading(false);
        enqueueSnackbar('Error closing inquiry', { variant: 'error' });
      });
  };

  const handleUpdate = () => {
    if (inquiry.status === 'closed') return;
    
    setLoading(true);
    const updatedInquiry = {
      ...inquiry,
      status,
      comments
    };
    
    axios
      .put(`http://localhost:5555/inquiry/${id}`, updatedInquiry)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Inquiry updated successfully', { variant: 'success' });
      })
      .catch((error) => {
        console.error('Error updating inquiry:', error);
        setLoading(false);
        enqueueSnackbar('Error updating inquiry', { variant: 'error' });
      });
  };

  // Priority color mapping with improved visual cues
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Priority icon mapping
  const getPriorityIcon = (priority) => {
    const baseClasses = "inline-block mr-1 text-lg";
    switch(priority) {
      case 'urgent': return <MdFlag className={`${baseClasses} text-red-600`} />;
      case 'high': return <MdFlag className={`${baseClasses} text-orange-600`} />;
      case 'medium': return <MdFlag className={`${baseClasses} text-yellow-600`} />;
      case 'low': return <MdFlag className={`${baseClasses} text-green-600`} />;
      default: return <MdFlag className={`${baseClasses} text-gray-500`} />;
    }
  };

  // Status color mapping with improved visual cues
  const getStatusColor = (status) => {
    switch(status) {
      case 'closed': return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'resolved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

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

  if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;

  if (!inquiry) return (
    <div className="p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <MdMessage className="text-4xl text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-700">Inquiry not found</h3>
      <p className="text-gray-500 mt-2">The inquiry you're looking for may have been removed or is still loading.</p>
    </div>
  );

  const isClosed = inquiry.status === 'closed';

  return (
    <div className="p-6">
      {!dashboardMode && (
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-4">
            <MdMessage className="text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Respond to Inquiry</h1>
        </div>
      )}
      
      {isClosed && (
        <div className="flex items-start rounded-md bg-gray-50 border-l-4 border-gray-500 text-gray-700 p-4 mb-6">
          <MdClose className="text-lg mt-0.5 mr-2 text-gray-500" />
          <div>
            <p className="font-semibold">This inquiry is closed</p>
            <p className="text-sm">No further modifications can be made.</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Inquiry Details Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{inquiry.subject}</h2>
              <div className="text-sm font-medium text-gray-500 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
                #{inquiry.inquiryID || inquiry._id?.substring(0, 8)}
              </div>
            </div>
            
            <div className="p-6">
              {/* Status and Priority */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center">
                  {getPriorityIcon(inquiry.priority)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(inquiry.priority)}`}>
                    {inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)} Priority
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  {inquiry.category}
                </span>
              </div>
              
              {/* Customer and Inquiry Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3 border-b border-gray-200 pb-1">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <MdPerson className="text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-medium">{inquiry.name}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <MdEmail className="text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">{inquiry.email}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <MdPhone className="text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium">{inquiry.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <MdBusiness className="text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Company</p>
                        <p className="font-medium">{inquiry.company || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3 border-b border-gray-200 pb-1">Inquiry Details</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <MdLabel className="text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="font-medium">{inquiry.category}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <MdAccessTime className="text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Created On</p>
                        <p className="font-medium">{formatDate(inquiry.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <MdPerson className="text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Created By</p>
                        <p className="font-medium">{inquiry.createdBy || 'System'}</p>
                      </div>
                    </div>
                    {inquiry.statusUpdatedAt && (
                      <div className="flex">
                        <MdAccessTime className="text-gray-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Last Updated</p>
                          <p className="font-medium">{formatDate(inquiry.statusUpdatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Message */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <MdMessage className="text-gray-500 mr-2" /> Customer Message
                </h3>
                <div className="border rounded-lg p-4 bg-gray-50 border-gray-200 whitespace-pre-wrap">
                  {inquiry.message}
                </div>
              </div>
              
              {/* Attachments */}
              {inquiry.attachments && inquiry.attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <MdOutlineAttachment className="text-gray-500 mr-2" /> Attachments
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <ul className="space-y-2">
                      {inquiry.attachments.map((attachment, index) => (
                        <li key={index} className="flex items-center hover:bg-gray-100 p-2 rounded-md transition-colors">
                          <MdOutlineAttachment className="text-blue-500 mr-2" />
                          <a 
                            href={attachment} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                          >
                            Attachment {index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced Response Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 sticky top-4">
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <MdMessage className="mr-2 text-sky-500" /> Response Actions
              </h2>
            </div>
            
            <div className="p-6">
              {/* Status Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => !isClosed && setStatus(e.target.value)}
                  disabled={isClosed}
                  className={`w-full border-2 rounded-lg px-3 py-2 ${
                    isClosed
                      ? 'bg-gray-100 cursor-not-allowed border-gray-300'
                      : 'border-sky-300 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {isClosed 
                    ? "Status cannot be changed once an inquiry is closed" 
                    : "Set the current status of this inquiry"}
                </p>
              </div>
              
              {/* Comments */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Response Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => !isClosed && setComments(e.target.value)}
                  className={`w-full border-2 rounded-lg px-3 py-2 ${
                    isClosed
                      ? 'bg-gray-100 cursor-not-allowed border-gray-300' 
                      : 'border-sky-300 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50'
                  }`}
                  rows="6"
                  placeholder={isClosed ? "Comments are locked for closed inquiries" : "Add your response or internal notes here..."}
                  disabled={isClosed}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  {isClosed 
                    ? "Comments cannot be modified in closed inquiries" 
                    : "These comments will be saved with the inquiry"}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleUpdate}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-medium ${
                    isClosed 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sm'
                  }`}
                  disabled={isClosed}
                >
                  <MdSave className="text-lg" />
                  Update Inquiry
                </button>
                <button 
                  onClick={handleClose}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-medium ${
                    isClosed 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm'
                  }`}
                  disabled={isClosed}
                >
                  <MdClose className="text-lg" />
                  Close Inquiry
                </button>
                
                {isClosed && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    This inquiry has been closed and cannot be modified
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseInquiry;