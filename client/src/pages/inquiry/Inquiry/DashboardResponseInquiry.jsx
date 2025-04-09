import React from 'react';
import ResponseInquiry from '../responseinquiry';
import { useNavigate } from 'react-router-dom';

const DashboardResponseInquiry = ({ inquiryId, onBack }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Respond to Inquiry</h1>
        <button
          onClick={() => onBack()}
          className='bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm'
        >
          Back to Inquiry List
        </button>
      </div>
      
      <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
        <ResponseInquiry inquiryId={inquiryId} dashboardMode={true} />
      </div>
    </>
  );
};

export default DashboardResponseInquiry;
