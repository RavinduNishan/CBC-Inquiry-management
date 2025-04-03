import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { useSnackbar } from 'notistack';

const ResponseInquiry = () => {
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigned, setAssigned] = useState('');
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mark Johnson' },
    // In a real app, you would fetch this list from your API
  ]);

  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5555/inquiry/${id}`)
      .then((response) => {
        const inquiryData = response.data;
        setInquiry(inquiryData);
        setAssigned(inquiryData.assigned || '');
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

  const handleAssign = () => {
    setLoading(true);
    axios
      .put(`http://localhost:5555/inquiry/${id}`, { 
        ...inquiry,
        assigned 
      })
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Inquiry assigned successfully', { variant: 'success' });
      })
      .catch((error) => {
        console.error('Error assigning inquiry:', error);
        setLoading(false);
        enqueueSnackbar('Error assigning inquiry', { variant: 'error' });
      });
  };

  const handleClose = () => {
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
        // Navigate back after closing
        navigate('/');
      })
      .catch((error) => {
        console.error('Error closing inquiry:', error);
        setLoading(false);
        enqueueSnackbar('Error closing inquiry', { variant: 'error' });
      });
  };

  const handleUpdate = () => {
    setLoading(true);
    const updatedInquiry = {
      ...inquiry,
      status,
      assigned,
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

  // Priority color mapping
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading) return <Spinner />;

  if (!inquiry) return (
    <div className="p-4">
      <BackButton />
      <div className="text-center mt-8">Inquiry not found or still loading...</div>
    </div>
  );

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-3xl my-4">Respond to Inquiry</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiry Details Section */}
        <div className="lg:col-span-2 border-2 border-sky-400 rounded-xl p-4">
          <h2 className="text-2xl font-semibold mb-4">{inquiry.subject}</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(inquiry.priority)}`}>
              {inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)} Priority
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inquiry.status)}`}>
              {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-500">From</p>
              <p className="font-medium">{inquiry.name}</p>
              <p>{inquiry.email}</p>
              <p>{inquiry.phone}</p>
              <p className="mt-2">{inquiry.company}</p>
            </div>
            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-medium">{inquiry.category}</p>
              <p className="mt-2 text-gray-500">Created At</p>
              <p>{formatDate(inquiry.createdAt)}</p>
              <p className="mt-2 text-gray-500">Created By</p>
              <p>{inquiry.createdBy}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Message</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              {inquiry.message}
            </div>
          </div>
          
          {inquiry.attachments && inquiry.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Attachments</h3>
              <ul className="list-disc list-inside">
                {inquiry.attachments.map((attachment, index) => (
                  <li key={index} className="text-blue-600 hover:underline">
                    <a href={attachment} target="_blank" rel="noopener noreferrer">
                      Attachment {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Response Section */}
        <div className="border-2 border-sky-400 rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-4">Response Actions</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-md p-2"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Assign To</label>
            <select
              value={assigned}
              onChange={(e) => setAssigned(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-md p-2"
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.name}>{user.name}</option>
              ))}
            </select>
            <button 
              onClick={handleAssign}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
              Assign
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-md p-2"
              rows="5"
              placeholder="Add your comments or notes here..."
            ></textarea>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleUpdate}
              className="flex-1 bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
            >
              Update
            </button>
            <button 
              onClick={handleClose}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close Inquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseInquiry;