import React, { useState, useEffect, Fragment, useContext } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { FiSearch, FiUser, FiMail, FiPhone, FiBriefcase, FiShield } from 'react-icons/fi';
import Spinner from '../user/Spinner';
import { useSnackbar } from 'notistack';
import AuthContext from '../../context/AuthContext';

const AssignUserModal = ({ isOpen, onClose, inquiryId, currentAssignee, inquiryDepartment }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser } = useContext(AuthContext);

  // Fetch users with improved department-based filtering
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5555/user');
        const allUsers = response.data.data;
        
        // Check if current user is admin or department manager
        const isCurrentUserAdmin = currentUser?.accessLevel === 'admin';
        const isCurrentUserManager = currentUser?.accessLevel === 'manager';
        
        // Apply department-based filtering based on role:
        let eligibleUsers = [];
        
        if (isCurrentUserAdmin || isCurrentUserManager) {
          eligibleUsers = allUsers.filter(user => 
            // Include all admins
            user.accessLevel === 'admin' || 
            // Include department managers from the inquiry's department
            (user.accessLevel === 'manager' && user.department === inquiryDepartment)
          );
        } else {
          console.warn("User without sufficient permissions attempting to assign inquiry");
          // Return empty list for users without assign permissions as fallback
          eligibleUsers = [];
        }
        
        // Filter out current assignee if already assigned
        const availableUsers = eligibleUsers.filter(
          user => !currentAssignee || user._id !== currentAssignee
        );
        
        console.log(`Filtered users for department ${inquiryDepartment}:`, availableUsers);
        
        setUsers(availableUsers);
        setFilteredUsers(availableUsers);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching users for assignment - handling gracefully');
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, inquiryDepartment, currentAssignee, currentUser]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Handle user selection
  const handleUserSelect = (user) => {
    console.log("Selected user:", user);
    setSelectedUserId(user._id);
    setSelectedUserName(user.name);
  };

  // Handle assignment submission
  const handleAssign = async () => {
    if (!selectedUserId) {
      enqueueSnackbar('Please select a user to assign', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      console.log("Selected user for assignment:", selectedUserId, selectedUserName);
      
      // Create assigned object with userId and name
      const updateData = {
        assigned: {
          userId: selectedUserId,
          name: selectedUserName
        }
      };
      
      console.log("Sending assignment data:", updateData);

      // Update the inquiry with the assigned user object
      const response = await axios.put(`http://localhost:5555/inquiry/${inquiryId}`, updateData);

      console.log("Assignment response:", response.data);
      
      // Verify the user assignment was stored
      if (response.data.assigned && response.data.assigned.userId) {
        console.log("Successfully stored assigned user:", response.data.assigned);
      } else {
        console.warn("Warning: assigned user data not found in response");
      }
      
      enqueueSnackbar('Inquiry assigned successfully', { variant: 'success' });
      setLoading(false);
      onClose(true); // Close with refresh signal
    } catch (error) {
      console.error('Error assigning inquiry:', error);
      
      // Provide detailed error information
      if (error.response) {
        console.error('Server error response:', error.response.data);
        enqueueSnackbar(`Error: ${error.response.data.message || 'Assignment failed'}`, { variant: 'error' });
      } else {
        enqueueSnackbar('Error connecting to server', { variant: 'error' });
      }
      
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => onClose(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Assign Inquiry to User
                </Dialog.Title>
                
                {inquiryDepartment && (
                  <div className="mb-4 rounded-md bg-blue-50 p-3 border border-blue-100">
                    <div className="flex">
                      <FiBriefcase className="h-5 w-5 text-blue-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Department Filter Applied</h3>
                        <div className="text-xs text-blue-700 mt-1">
                          <p>Showing users who can be assigned to this inquiry:</p>
                          <ul className="list-disc ml-5 mt-1">
                            <li>All administrators</li>
                            <li>Department managers from {inquiryDepartment}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Box */}
                <div className="mb-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    placeholder="Search users by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto rounded-md border border-gray-200 mb-4">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div 
                          key={user._id}
                          onClick={() => handleUserSelect(user)}
                          className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            selectedUserId === user._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              {user.accessLevel === 'admin' ? (
                                <FiShield className="text-blue-600" />
                              ) : (
                                <FiUser className="text-blue-600" />
                              )}
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {user.name}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                  user.accessLevel === 'admin' 
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {user.accessLevel}
                                </span>
                              </div>
                              <div className="flex text-xs text-gray-500 mt-1">
                                <div className="flex items-center mr-4">
                                  <FiMail className="mr-1" />
                                  {user.email}
                                </div>
                                <div className="flex items-center">
                                  <FiBriefcase className="mr-1" />
                                  {user.department}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No eligible users found for assignment
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => onClose(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAssign}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                    disabled={loading || !selectedUserId}
                  >
                    {loading ? 'Assigning...' : 'Assign User'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AssignUserModal;
