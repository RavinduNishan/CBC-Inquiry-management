import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';

const InquiryTable = ({ inquiries }) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-3 border">Name</th>
          <th className="p-3 border">Email</th>
          <th className="p-3 border">Status</th>
          <th className="p-3 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {inquiries.map((inquiry) => (
          <tr key={inquiry._id} className="hover:bg-gray-50">
            <td className="p-3 border">{inquiry.name}</td>
            <td className="p-3 border">{inquiry.email}</td>
            <td className="p-3 border">{inquiry.status}</td>
            <td className="p-3 border">
              <div className="flex gap-2 justify-center">
                <Link to={`/inquiries/${inquiry._id}`}>
                  <BsInfoCircle className="text-blue-500 hover:text-blue-700" />
                </Link>
                <Link to={`/inquiries/edit/${inquiry._id}`}>
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