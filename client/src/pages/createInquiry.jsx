import React, { useState } from 'react';

const CreateInquiry = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    category: '',
    subject: '',
    attachments: [],
    message: '',
    priority: '',
    assigned: '',
    createdBy: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Create Inquiry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Name" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="text" name="company" placeholder="Company" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="text" name="category" placeholder="Category" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="text" name="subject" placeholder="Subject" className="w-full p-2 border rounded" onChange={handleChange} required />
        <textarea name="message" placeholder="Message" className="w-full p-2 border rounded" onChange={handleChange} required></textarea>
        <input type="text" name="priority" placeholder="Priority" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="text" name="assigned" placeholder="Assigned To (optional)" className="w-full p-2 border rounded" onChange={handleChange} />
        <input type="text" name="createdBy" placeholder="Created By" className="w-full p-2 border rounded" onChange={handleChange} required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Submit Inquiry</button>
      </form>
    </div>
  );
};

export default CreateInquiry;
