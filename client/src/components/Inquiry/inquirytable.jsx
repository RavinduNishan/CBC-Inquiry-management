import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';



const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', // GMT+5:30
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
  });
};
const InquiryTable = ({ inquiries }) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-3 border">Name</th>
          <th className="p-3 border">Email</th>
          <th className="p-3 border">Contact</th>
          <th className="p-3 border">Company</th>
          <th className="p-3 border">Subject</th>
          <th className="p-3 border">Priority</th>
          <th className="p-3 border">Assigned</th>
          <th className="p-3 border">Created At</th>

          <th className="p-3 border">Status</th>
          <th className="p-3 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {inquiries.map((inquiry) => (
          <tr key={inquiry._id} className="hover:bg-gray-50">
            <td className="p-3 border">{inquiry.name}</td>
            <td className="p-3 border">{inquiry.email}</td>
            <td className="p-3 border">{inquiry.phone}</td>
            <td className="p-3 border">{inquiry.company}</td>
            <td className="p-3 border">{inquiry.subject}</td>
            <td className="p-3 border">{inquiry.priority}</td>
            <td className="p-3 border">{inquiry.assigned}</td>
            <td className="p-3 border">{formatDate(inquiry.createdAt)}</td>
            <td className="p-3 border">{inquiry.status}</td>
            <td className="p-3 border">
              <div className="flex gap-2 justify-center">
                <Link to={`/inquiries/${inquiry._id}`}>
                  <BsInfoCircle className="text-blue-500 hover:text-blue-700" />
                </Link>
                <Link to={`/inquiry/response/${inquiry._id}`}>
                  <AiOutlineEdit className="text-yellow-500 hover:text-yellow-700" />
                </Link>
                <Link to={`/inquiries/delete/${inquiry._id}`}>
                  <MdOutlineDelete className="text-red-500 hover:text-red-700" />
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InquiryTable;