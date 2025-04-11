import React from 'react';
import ResponseInquiry from '../responseinquiry';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdMessage } from 'react-icons/md';

const DashboardResponseInquiry = ({ inquiryId, onBack }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-0 overflow-hidden">
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
      
      <div className='bg-white'>
        <ResponseInquiry inquiryId={inquiryId} dashboardMode={true} />
      </div>
    </div>
  );
};

export default DashboardResponseInquiry;
