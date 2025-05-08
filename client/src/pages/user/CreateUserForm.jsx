// import React, { useState } from 'react';
// import axios from 'axios';
// import { useSnackbar } from 'notistack';
// import { MdPerson, MdEmail, MdPhone, MdBusiness, MdSecurity, MdLock } from 'react-icons/md';

// const CreateUserForm = ({ onUserCreated, onCancel }) => {
//   // Form state
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     department: '',
//     status: 'active', // Default status
//     password: ''
//   });

//   // Department options - can be expanded or fetched from API
//   const departments = [
//     'Finance',
//     'Marketing',
//     'Operations',
//     'Information Technology',
//     'Human Resources',
//     'Customer Service',
//     'Sales',
//     'Research & Development',
//     'Legal',
//     'Executive'
//   ];

//   // Form submission states
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
//   const { enqueueSnackbar } = useSnackbar();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
    
//     // Clear error for this field when user starts typing
//     if (errors[name]) {
//       setErrors({
//         ...errors,
//         [name]: ''
//       });
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     // Required field validation
//     if (!formData.name.trim()) newErrors.name = 'Name is required';
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
//     if (!formData.department) newErrors.department = 'Department is required';
//     if (!formData.password) newErrors.password = 'Password is required';
    
//     // Email validation
//     if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }
    
//     // Password length validation
//     if (formData.password && formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate form
//     if (!validateForm()) return;
    
//     setIsSubmitting(true);
    
//     try {
//       // Get auth token (if logged in as admin)
//       const token = localStorage.getItem('token');
      
//       const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
//       // Call API to create user
//       const response = await axios.post(
//         'http://localhost:5555/user',
//         formData,
//         { headers }
//       );
      
//       enqueueSnackbar('User created successfully!', { variant: 'success' });
      
//       // Call the callback function to refresh the user list
//       if (onUserCreated) {
//         onUserCreated();
//       }
//     } catch (error) {
//       console.error('Error creating user:', error);
      
//       // Display error message
//       const errorMessage = error.response?.data?.message || 'Failed to create user';
//       enqueueSnackbar(errorMessage, { variant: 'error' });
      
//       // Handle validation errors from server
//       if (error.response?.data?.errors) {
//         setErrors(error.response.data.errors);
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md border border-gray-200">
//       <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 border-b border-gray-200">
//         <h2 className="text-xl font-semibold text-gray-800">Create New User</h2>
//         <p className="text-sm text-gray-600">Fill in the details to create a new user account</p>
//       </div>
      
//       <form onSubmit={handleSubmit} className="p-5">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Personal Information Section */}
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
//               <MdPerson className="mr-1 text-sky-500" /> Personal Information
//             </h3>
            
//             <div className="space-y-4">
//               {/* Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
//                   placeholder="Enter full name"
//                 />
//                 {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
//               </div>
              
//               {/* Email */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 flex items-center">
//                   <MdEmail className="mr-1 text-sky-500" /> Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
//                   placeholder="user@example.com"
//                 />
//                 {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
//               </div>
              
//               {/* Phone */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 flex items-center">
//                   <MdPhone className="mr-1 text-sky-500" /> Phone
//                 </label>
//                 <input
//                   type="text"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${errors.phone ? 'border-red-500' : ''}`}
//                   placeholder="(123) 456-7890"
//                 />
//                 {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
//               </div>
              
//               {/* Department - New Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 flex items-center">
//                   <MdBusiness className="mr-1 text-sky-500" /> Department
//                 </label>
//                 <select
//                   name="department"
//                   value={formData.department}
//                   onChange={handleChange}
//                   className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${errors.department ? 'border-red-500' : ''}`}
//                 >
//                   <option value="">Select Department</option>
//                   {departments.map(dept => (
//                     <option key={dept} value={dept}>{dept}</option>
//                   ))}
//                 </select>
//                 {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
//               </div>
//             </div>
//           </div>
          
//           {/* Security Section */}
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
//               <MdSecurity className="mr-1 text-sky-500" /> Account Settings
//             </h3>
            
//             <div className="space-y-4">
//               {/* Status */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Status</label>
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
//                 >
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </div>
              
//               {/* Password */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 flex items-center">
//                   <MdLock className="mr-1 text-sky-500" /> Password
//                 </label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${errors.password ? 'border-red-500' : ''}`}
//                   placeholder="Set initial password"
//                 />
//                 {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
//                 <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {/* Form Buttons */}
//         <div className="mt-8 flex justify-end space-x-3">
//           <button
//             type="button"
//             onClick={onCancel}
//             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
//             disabled={isSubmitting}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center"
//           >
//             {isSubmitting ? 'Creating...' : 'Create User'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CreateUserForm;
