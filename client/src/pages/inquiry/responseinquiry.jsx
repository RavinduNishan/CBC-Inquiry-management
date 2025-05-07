import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../user/Spinner';
import { useSnackbar } from 'notistack';
import { MdPerson, MdEmail, MdPhone, MdBusiness, MdLabel, MdAccessTime, MdMessage, MdOutlineAttachment, MdSave, MdClose, MdFlag, MdSend, MdArrowBack } from 'react-icons/md';
import AuthContext from '../../context/AuthContext';

const ResponseInquiry = ({ inquiryId: propId, dashboardMode = false, onBack }) => {
  const { user } = useContext(AuthContext);
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState([]);

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
    const updatedInquiry = {
      ...inquiry,
      status: 'closed',
      sendClosureEmail: true
    };
    
    axios
      .put(`http://localhost:5555/inquiry/${id}`, updatedInquiry)
      .then((response) => {
        // Update local state with the closed inquiry data
        setInquiry({...updatedInquiry, statusUpdatedAt: new Date().toISOString()});
        setLoading(false);
        
        // Show appropriate message based on email status
        if (response.data.emailSent) {
          enqueueSnackbar('Inquiry closed successfully and notification email sent', { variant: 'success' });
        } else {
          enqueueSnackbar('Inquiry closed successfully, but email notification failed', { variant: 'warning' });
        }
      })
      .catch((error) => {
        console.error('Error closing inquiry:', error);
        setLoading(false);
        enqueueSnackbar('Error closing inquiry', { variant: 'error' });
      });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    
    setLoading(true);
    
    const commentData = {
      newComment: {
        text: newComment.trim(),
        userId: user._id,
        userName: user.name
      }
    };
    
    axios
      .put(`http://localhost:5555/inquiry/${id}`, commentData)
      .then((response) => {
        setInquiry(response.data);
        setNewComment(''); // Clear input after successful submission
        setLoading(false);
        enqueueSnackbar('Comment added successfully', { variant: 'success' });
      })
      .catch((error) => {
        console.error('Error adding comment:', error);
        setLoading(false);
        enqueueSnackbar('Error adding comment', { variant: 'error' });
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
  const hasComments = Array.isArray(inquiry.comments) && inquiry.comments.length > 0;

  return (
    <div className={dashboardMode ? "p-0" : "p-6"}>
      {dashboardMode ? (
        <div className='flex justify-between items-center p-6 border-b border-gray-200 bg-white'>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-4">
              <MdMessage className="text-xl" />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>Respond to Inquiry</h1>
              <p className="text-sm text-gray-500">Review and respond to customer inquiries</p>
            </div>
          </div>
          <button
            onClick={() => onBack()}
            className='bg-white hover:bg-gray-50 text-gray-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm border border-gray-200'
          >
            <MdArrowBack className="mr-2" /> Back to Inquiry List
          </button>
        </div>
      ) : (
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
              
              {/* Comment Thread Section */}
              <div className="mt-8">
                <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <MdMessage className="text-gray-500 mr-2" /> Comments Thread
                </h3>
                
                <div className="border rounded-lg bg-gray-50 border-gray-200 mb-4">
                  {/* Chat-style comment display */}
                  <div className="h-80 overflow-y-auto p-4 space-y-4">
                    {hasComments ? (
                      inquiry.comments.map((comment, index) => (
                        <div key={index} className="flex flex-col">
                          <div className={`max-w-3/4 rounded-lg p-3 shadow-sm ${
                            comment.userId === user?._id ? 
                            'bg-blue-100 text-blue-900 ml-auto' : 
                            'bg-white text-gray-800 border border-gray-200'
                          }`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm">{comment.userName || 'Unknown User'}</span>
                              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        <p>No comments yet. Be the first to add a comment.</p>
                      </div>
                    )}
                  </div>
                  
                  {/* New comment input */}
                  <div className="p-3 border-t border-gray-200">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => !isClosed && setNewComment(e.target.value)}
                        disabled={isClosed}
                        placeholder={isClosed ? "Comments disabled for closed inquiries" : "Type your comment here..."}
                        className={`flex-1 border rounded-l-lg py-2 px-3 ${
                          isClosed ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:outline-none focus:ring-1 focus:ring-sky-500'
                        }`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !isClosed && newComment.trim()) {
                            handleAddComment();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={isClosed || !newComment.trim()}
                        className={`flex items-center justify-center bg-sky-500 text-white px-4 py-2 rounded-r-lg ${
                          isClosed || !newComment.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-600'
                        }`}
                      >
                        <MdSend className="text-lg" />
                      </button>
                    </div>
                    {isClosed && (
                      <p className="text-xs text-gray-500 mt-1">
                        Comments are disabled for closed inquiries
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
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