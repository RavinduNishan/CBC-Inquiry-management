import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Spinner from '../../user/Spinner';
import AuthContext from '../../../context/AuthContext';
import { MdPerson, MdEmail, MdPhone, MdBusiness, MdFlag, MdDescription, MdLabel, MdSend, MdClose } from 'react-icons/md';

const CreateInquiry = ({ onSuccess }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inquiry, setInquiry] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    category: 'General',
    subject: '',
    message: '',
    priority: 'Medium',
    createdBy: user?.name || 'System'
  });

  const handleChange = (e) => {
    setInquiry({
      ...inquiry,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    axios
      .post('http://localhost:5555/inquiry', inquiry)
      .then(() => {
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
        console.log(error);
        alert('An error occurred while creating the inquiry');
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
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <MdPerson className="mr-2 text-sky-500" />
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdPerson className="mr-1.5 text-gray-500" />
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={inquiry.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500 transition-all"
                />
              </div>
              
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdEmail className="mr-1.5 text-gray-500" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={inquiry.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500 transition-all"
                />
              </div>
              
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdPhone className="mr-1.5 text-gray-500" />
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={inquiry.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500 transition-all"
                />
              </div>
              
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdBusiness className="mr-1.5 text-gray-500" />
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={inquiry.company}
                  onChange={handleChange}
                  required
                  placeholder="Enter company name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-200 focus:border-sky-500 transition-all"
                />
              </div>
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
            
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">From</p>
                <p className="font-medium">{inquiry.name}</p>
                <p className="text-sm">{inquiry.email}</p>
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
            </div>
            
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
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg shadow-sm flex items-center transition-colors"
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