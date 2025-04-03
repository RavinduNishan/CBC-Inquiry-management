import React, { useState } from 'react';
import BackButton from '../../components/BackButton';
import Spinner from '../../components/Spinner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const CreateInquiry = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSaveInquiry = () => {
    // Validation
    if (!name || !email || !phone || !company || !category || !subject || !message || !priority) {
      setError('Please fill all required fields');
      enqueueSnackbar('Please fill all required fields', { variant: 'error' });
      return;
    }
    
    const data = {
      name,
      email,
      phone,
      company,
      category,
      subject,
      message,
      priority,
      
      attachments: [], // Empty array since we're not handling file uploads yet
      createdBy: 'user', // You might want to get this from authentication context
    };
    
    setLoading(true);
    // Make sure this URL matches your backend API endpoint exactly
    axios
      .post('http://localhost:5555/inquiry', data)
      .then((response) => {
        setLoading(false);
        console.log('Success response:', response);
        enqueueSnackbar('Inquiry Created successfully', { variant: 'success' });
        navigate('/');
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error details:', error.response ? error.response.data : error.message);
        setError(error.response ? error.response.data.message : error.message);
        enqueueSnackbar('Error creating inquiry: ' + (error.response ? error.response.data.message : error.message), { variant: 'error' });
      });
  };

  return (
    <div className='p-4'>
      <BackButton />
      <h1 className='text-3xl my-4'>Create Inquiry</h1>
      {loading ? <Spinner /> : ''}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className='flex flex-col border-2 border-sky-400 rounded-xl w-[600px] p-4 mx-auto'>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Name*</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
            required
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Email*</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
            required
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Phone*</label>
          <input
            type='tel'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
            required
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Company*</label>
          <input
            type='text'
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
            required
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Category*</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
            required
          >
            <option value="">Select a category</option>
            <option value="technical">Technical</option>
            <option value="sales">Sales</option>
            <option value="support">Support</option>
            <option value="feedback">Feedback</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Subject*</label>
          <input
            type='text'
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
            required
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Message*</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
            rows="4"
            required
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Priority*</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Assigned*</label>
          <input
            type='text'
            value={assigned}
            onChange={(e) => setSubject(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
            required
          />
        </div>
        <button 
          className='p-2 bg-sky-300 m-8 hover:bg-sky-500' 
          onClick={handleSaveInquiry}
        >
          Create Inquiry
        </button>
      </div>
    </div>
  );
}

export default CreateInquiry;