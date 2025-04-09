import React, { useState } from 'react';
//import BackButton from '../../components/BackButton';
import Spinner from '../user/Spinner';
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
  const [assigned, setAssigned] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSaveInquiry = () => {
    // Validation
    if (!name || !email || !phone || !company || !category || !subject || !message || !priority || !assigned) {
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
      assigned,
      attachments: [],
      createdBy: 'user',
    };
    
    setLoading(true);
    axios
      .post('http://localhost:5555/inquiry', data)
      .then((response) => {
        setLoading(false);
        enqueueSnackbar('Inquiry Created successfully', { variant: 'success' });
        navigate('/');
      })
      .catch((error) => {
        setLoading(false);
        setError(error.response ? error.response.data.message : error.message);
        enqueueSnackbar('Error creating inquiry: ' + (error.response ? error.response.data.message : error.message), { variant: 'error' });
      });
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        <div className='flex items-center mb-8'>
          {/* <BackButton /> */}
          <h1 className='text-3xl font-bold text-gray-900 ml-4'>Create New Inquiry</h1>
        </div>
        
        {loading && (
          <div className='flex justify-center my-8'>
            <Spinner />
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
          <div className='px-4 py-5 sm:px-6 border-b border-gray-200'>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>Inquiry Details</h3>
            <p className='mt-1 text-sm text-gray-500'>Fill in the details to create a new inquiry.</p>
          </div>
          
          <div className='px-4 py-5 sm:p-6'>
            <div className='grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6'>
              <div className='sm:col-span-3'>
                <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                  Full Name *
                </label>
                <div className='mt-1'>
                  <input
                    type='text'
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    placeholder='John Doe'
                    required
                  />
                </div>
              </div>

              <div className='sm:col-span-3'>
                <label htmlFor='company' className='block text-sm font-medium text-gray-700'>
                  Company *
                </label>
                <div className='mt-1'>
                  <input
                    type='text'
                    id='company'
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    placeholder='Company Inc.'
                    required
                  />
                </div>
              </div>

              <div className='sm:col-span-3'>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                  Email Address *
                </label>
                <div className='mt-1'>
                  <input
                    type='email'
                    id='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    placeholder='user@example.com'
                    required
                  />
                </div>
              </div>

              <div className='sm:col-span-3'>
                <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>
                  Phone Number *
                </label>
                <div className='mt-1'>
                  <input
                    type='tel'
                    id='phone'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    placeholder='+1 (555) 123-4567'
                    required
                  />
                </div>
              </div>

              <div className='sm:col-span-3'>
                <label htmlFor='category' className='block text-sm font-medium text-gray-700'>
                  Category *
                </label>
                <div className='mt-1'>
                  <select
                    id='category'
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
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
              </div>

              <div className='sm:col-span-3'>
                <label htmlFor='priority' className='block text-sm font-medium text-gray-700'>
                  Priority *
                </label>
                <div className='mt-1'>
                  <select
                    id='priority'
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className='sm:col-span-6'>
                <label htmlFor='subject' className='block text-sm font-medium text-gray-700'>
                  Subject *
                </label>
                <div className='mt-1'>
                  <input
                    type='text'
                    id='subject'
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    placeholder='Brief description of your inquiry'
                    required
                  />
                </div>
              </div>

              <div className='sm:col-span-6'>
                <label htmlFor='message' className='block text-sm font-medium text-gray-700'>
                  Message *
                </label>
                <div className='mt-1'>
                  <textarea
                    id='message'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    rows="4"
                    placeholder='Please provide detailed information about your inquiry...'
                    required
                  />
                </div>
              </div>

              <div className='sm:col-span-6'>
                <label htmlFor='assigned' className='block text-sm font-medium text-gray-700'>
                  Assigned To *
                </label>
                <div className='mt-1'>
                  <input
                    type='text'
                    id='assigned'
                    value={assigned}
                    onChange={(e) => setAssigned(e.target.value)}
                    className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border'
                    placeholder='Assign to team member'
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='px-4 py-3 bg-gray-50 text-right sm:px-6'>
            <button
              type='button'
              onClick={handleSaveInquiry}
              className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            >
              Create Inquiry
            </button>
          </div>
        </div>

        <div className='mt-8 bg-white shadow sm:rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>About Inquiry Priorities</h3>
            <div className='mt-2 max-w-xl text-sm text-gray-500'>
              <div className='mb-2'>
                <span className='font-medium'>Urgent:</span> Critical issues requiring immediate attention (response within 1 hour)
              </div>
              <div className='mb-2'>
                <span className='font-medium'>High:</span> Important issues (response within 4 hours)
              </div>
              <div className='mb-2'>
                <span className='font-medium'>Medium:</span> Standard issues (response within 24 hours)
              </div>
              <div>
                <span className='font-medium'>Low:</span> General questions or non-critical issues (response within 48 hours)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateInquiry;