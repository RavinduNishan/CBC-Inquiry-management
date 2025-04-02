import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';

const InquiryCard = ({ inquiries }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inquiries.map((inquiry) => (
                <div key={inquiry._id} className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg">{inquiry.name}</h3>
                    <p className="text-gray-600 text-sm">{inquiry.email}</p>
                    <div className="mt-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full 
                            ${inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                inquiry.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                            {inquiry.status}
                        </span>
                        <span className={`ml-2 text-xs font-semibold px-2 py-1 rounded-full 
                            ${inquiry.priority === 'high' ? 'bg-red-100 text-red-800' :
                                inquiry.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                                    'bg-blue-100 text-blue-800'}`}>
                            {inquiry.priority}
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        {inquiry.message.substring(0, 60)}...
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
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
                </div>
            ))}
        </div>
    );
};

export default InquiryCard;