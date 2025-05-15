import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Spinner from '../user/Spinner';
import AuthContext from '../../context/AuthContext';
import { MdPerson, MdEmail, MdPhone, MdBusiness, MdFlag, MdDescription, MdLabel, MdSend, MdClose, MdPersonAdd, MdAssignmentInd } from 'react-icons/md';

const CreateInquiry = ({ onSuccess }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [inquiry, setInquiry] = useState({
    client: '',
    category: 'General',
    subject: '',
    message: '',
    priority: 'Medium',
    createdBy: user?.name || 'System',
    comments: [], // Initialize comments as an array to match the updated schema
    assigned: { userId: '', name: '' } // Add assigned field
  });

  // Check if user is admin or department manager
  const isAdminOrManager = user?.accessLevel === 'admin' || user?.accessLevel === 'manager';
  // Check for admin only
  const isAdmin = user?.accessLevel === 'admin';

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setClientsLoading(true);
        const response = await axios.get('http://localhost:5555/client');
        const allClients = response.data.data;
        setClients(allClients);
        
        // Filter clients based on user department and access level
        if (user && user.accessLevel === 'admin') {
          // Admins can see all clients
          setFilteredClients(allClients);
        } else if (user && user.department) {
          // Department managers/staff can only see clients from their department
          const departmentClients = allClients.filter(
            client => client.department === user.department
          );
          setFilteredClients(departmentClients);
        } else {
          setFilteredClients([]);
        }
        
        setClientsLoading(false);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  // Fetch assignable users when client changes - update to allow both admin and manager to assign
  useEffect(() => {
    const fetchAssignableUsers = async () => {
      // Allow both admins and department managers to assign
      if (!selectedClient || !isAdminOrManager) return;
      
      setLoadingUsers(true);
      try {
        const response = await axios.get('http://localhost:5555/user');
        const allUsers = response.data.data;
        
        // Filter users based on user role:
        // Same filtering logic for both admin and managers - they can assign to the same set of users
        const filteredUsers = allUsers.filter(u => 
          // Include all admins
          u.accessLevel === 'admin' || 
          // Include department managers from the client's department
          (u.accessLevel === 'manager' && u.department === selectedClient.department)
        );
        
        setAssignableUsers(filteredUsers);
        setLoadingUsers(false);
      } catch (error) {
        console.error('Error fetching assignable users:', error);
        setAssignableUsers([]);
        setLoadingUsers(false);
      }
    };

    fetchAssignableUsers();
  // Keep dependency array consistent with only the variables that are actually used
  }, [selectedClient, isAdminOrManager]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle special case for assigned user dropdown
    if (name === 'assignedUserId') {
      const selectedUser = assignableUsers.find(u => u._id === value);
      setInquiry({
        ...inquiry,
        assigned: {
          userId: value || '',
          name: selectedUser ? selectedUser.name : ''
        }
      });
    } else {
      setInquiry({
        ...inquiry,
        [name]: value
      });
    }

    // If client selection changed, update selectedClient
    if (name === 'client' && value) {
      const client = clients.find(c => c._id === value);
      setSelectedClient(client);
      
      // Reset assigned user when client changes
      setInquiry(prev => ({
        ...prev,
        assigned: { userId: '', name: '' }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate if user has permission to create inquiry for this client
    if (selectedClient && user && user.accessLevel !== 'admin' && user.department !== selectedClient.department) {
      setLoading(false);
      alert("You can only create inquiries for clients in your department");
      return;
    }
    
    // Create a new inquiry object with proper structure
    const inquiryData = {
      ...inquiry,
      // Make sure comments is an empty array, not an empty string
      comments: Array.isArray(inquiry.comments) ? inquiry.comments : [],
      // If no user is assigned, use empty object structure
      assigned: inquiry.assigned.userId ? inquiry.assigned : { userId: null, name: null }
    };
    
    console.log('Submitting inquiry data:', inquiryData);
    
    axios
      .post('http://localhost:5555/inquiry', inquiryData)
      .then((response) => {
        console.log('Inquiry created successfully:', response.data);
        setLoading(false);
        // If onSuccess callback exists, call it to navigate within dashboard
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        } else {
          // Otherwise use default navigation
          navigate('/dashboard');
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log('Error creating inquiry:', error);
        // Show more detailed error message if available
        if (error.response && error.response.data && error.response.data.message) {
          alert(`Error creating inquiry: ${error.response.data.message}`);
        } else {
          alert('An error occurred while creating the inquiry');
        }
      });
  };

  // Get category and priority icons
  const getCategoryIcon = (category) => {
    return <MdLabel className="text-sky-500" />;
  };

  const getPriorityIcon = (priority) => {
    const baseClasses = "mr-1.5";
    switch(priority) {
      case 'Urgent': return <MdFlag className={`${baseClasses} text-red-500`} />;
      case 'High': return <MdFlag className={`${baseClasses} text-orange-500`} />;
      case 'Medium': return <MdFlag className={`${baseClasses} text-yellow-500`} />;
      case 'Low': return <MdFlag className={`${baseClasses} text-green-500`} />;
      default: return <MdFlag className={`${baseClasses} text-gray-500`} />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-4">
          <MdSend className="text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Inquiry</h1>
          <p className="text-gray-500">Fill in the details below to submit a new inquiry</p>
        </div>
      </div>

      {loading ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <MdPerson className="mr-2 text-sky-500" />
              Client Selection
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {clientsLoading ? (
                <div className="flex justify-center p-4">
                  <Spinner />
                  <span className="ml-2">Loading clients...</span>
                </div>
              ) : (
                <div className="form-group">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <MdPerson className="mr-1.5 text-gray-500" />
                    Select Client
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="client"
                      value={inquiry.client}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500 transition-all appearance-none"
                    >
                      <option value="">-- Select a client --</option>
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <option key={client._id} value={client._id}>
                            {client.name} - {client.department} ({client.email})
                          </option>
                        ))
                      ) : (
                        <option disabled>No clients available for your department</option>
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCreateClient(!showCreateClient)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center"
                      title="Add New Client"
                    >
                      <MdPersonAdd className="text-xl" />
                    </button>
                  </div>
                  
                  {user && user.accessLevel !== 'admin' && (
                    <div className="mt-2 text-sm text-blue-600">
                      Note: You can only view and select clients from your department ({user.department}).
                    </div>
                  )}
                </div>
              )}

              {/* Display selected client information */}
              {selectedClient && (
                <div className="mt-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">Selected Client Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <MdPerson className="mr-1.5 text-blue-500" />
                      <span className="text-sm">{selectedClient.name}</span>
                    </div>
                    <div className="flex items-center">
                      <MdEmail className="mr-1.5 text-blue-500" />
                      <span className="text-sm">{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center">
                      <MdPhone className="mr-1.5 text-blue-500" />
                      <span className="text-sm">{selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MdBusiness className="mr-1.5 text-blue-500" />
                      <span className="text-sm">{selectedClient.department}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Assign User Section - Allow both admins AND department managers */}
              {isAdminOrManager && selectedClient && (
                <div className="mt-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                    <MdAssignmentInd className="mr-1.5 text-sky-500" />
                    Assign Inquiry
                  </h3>
                  
                  {loadingUsers ? (
                    <div className="flex items-center text-sm text-gray-600">
                      <Spinner size="sm" />
                      <span className="ml-2">Loading available users...</span>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="text-sm text-gray-600 block mb-1">
                        Assign this inquiry to:
                      </label>
                      <select
                        name="assignedUserId"
                        value={inquiry.assigned.userId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500 transition-all appearance-none"
                      >
                        <option value="">-- Unassigned --</option>
                        {assignableUsers.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.accessLevel} - {user.department})
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-sm text-gray-500">
                        {assignableUsers.length === 0 
                          ? "No eligible users found for assignment" 
                          : "You can assign to admins or department managers from client's department"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Inquiry Details */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <MdDescription className="mr-2 text-sky-500" />
              Inquiry Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdLabel className="mr-1.5 text-gray-500" />
                  Category
                </label>
                <select
                  name="category"
                  value={inquiry.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500 transition-all appearance-none"
                >
                  {['General', 'Technical', 'Sales', 'Support', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdFlag className="mr-1.5 text-gray-500" />
                  Priority
                </label>
                <select
                  name="priority"
                  value={inquiry.priority}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500 transition-all appearance-none"
                >
                  {['Low', 'Medium', 'High', 'Urgent'].map(priority => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group mb-4">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <MdDescription className="mr-1.5 text-gray-500" />
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={inquiry.subject}
                onChange={handleChange}
                required
                placeholder="Enter inquiry subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500 transition-all"
              />
            </div>
            
            <div className="form-group">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <MdDescription className="mr-1.5 text-gray-500" />
                Message
              </label>
              <textarea
                name="message"
                value={inquiry.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Enter inquiry details here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500 transition-all"
              ></textarea>
            </div>
          </div>
          
          {/* Preview & Form Actions */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Inquiry Preview</h2>
            
            {selectedClient ? (
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">From</p>
                  <p className="font-medium">{selectedClient.name}</p>
                  <p className="text-sm">{selectedClient.email}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Priority & Category</p>
                  <div className="flex items-center">
                    {getPriorityIcon(inquiry.priority)}
                    <span className="font-medium">{inquiry.priority}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    {getCategoryIcon(inquiry.category)}
                    <span className="ml-1.5">{inquiry.category}</span>
                  </div>
                </div>
                
                {/* Show assignment info in preview if assigned - Update to check for isAdminOrManager */}
                {isAdminOrManager && inquiry.assigned.userId && (
                  <div>
                    <p className="text-xs text-gray-500">Assignment</p>
                    <div className="flex items-center">
                      <MdAssignmentInd className="mr-1.5 text-blue-500" />
                      <span className="font-medium">{inquiry.assigned.name}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                Please select a client to continue.
              </div>
            )}
            
            <div className="flex justify-end gap-4 mt-6">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-300 shadow-sm flex items-center transition-colors"
              >
                <MdClose className="mr-1.5" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!selectedClient}
                className={`px-5 py-2.5 ${
                  !selectedClient 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
                } rounded-lg shadow-sm flex items-center transition-colors`}
              >
                <MdSend className="mr-1.5" />
                Create Inquiry
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateInquiry;