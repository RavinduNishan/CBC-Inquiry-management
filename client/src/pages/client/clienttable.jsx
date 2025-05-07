import React, { useState, useEffect } from 'react';
import { MdEdit, MdDelete, MdBusiness } from 'react-icons/md';
import { BsSearch } from 'react-icons/bs';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import EditClient from './editclient';

function ClientTable({ clients, fetchClients }) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  // Add state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);

  // Initialize filtered clients with all clients on component mount
  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, departmentFilter, clients]);

  const applyFilters = () => {
    if (!clients) return;
    
    const filtered = clients.filter(client => {
      const matchesSearch = !searchTerm || 
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !departmentFilter || client.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
    
    setFilteredClients(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
  };
  
  // Function to handle deleting a client
  const handleDeleteClient = async (clientId, clientName) => {
    if (window.confirm(`Are you sure you want to delete client: ${clientName}?`)) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5555/client/${clientId}`);
        enqueueSnackbar('Client deleted successfully', { variant: 'success' });
        
        // Refresh the client list
        if (fetchClients) {
          fetchClients();
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error deleting client';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to handle edit client action
  const handleEditClient = (client) => {
    setEditingClient(client);
  };

  // Function to close edit form
  const handleCloseEdit = () => {
    setEditingClient(null);
  };

  // Function to get badge color based on department
  const getDepartmentBadgeColor = (department) => {
    switch (department) {
      case 'CBC':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CBI':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'M~Line':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // If we're editing a client, show the edit form
  if (editingClient) {
    return (
      <EditClient 
        client={editingClient}
        onClose={handleCloseEdit}
        onClientUpdated={fetchClients}
      />
    );
  }

  // Otherwise show the client table
  return (
    <div className="flex flex-col h-full relative">
      {/* Sticky Search and Filter Controls */}
      <div className="sticky top-0 z-30 bg-white backdrop-blur-sm shadow-md">
        <div className="bg-white rounded-t-lg border border-gray-200 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 items-end">
            {/* Search Input */}
            <div className="relative col-span-1">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <BsSearch className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8 w-full py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            
            {/* Department Filter */}
            <div className="flex space-x-1">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">All Departments</option>
                <option value="CBC">CBC</option>
                <option value="CBI">CBI</option>
                <option value="M~Line">M~Line</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <div className="text-xs text-gray-500 flex items-center">
                <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-xs font-medium mr-1">
                  {filteredClients.length}
                </span> 
                clients found
              </div>
              
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clients table with filtered results */}
      <div className="overflow-x-auto h-full border border-gray-200 rounded-b-lg" style={{ height: 'calc(100% - 90px)' }}>
        {filteredClients && filteredClients.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
              <tr className="border-b border-gray-200">
                <th scope="col" className="px-6 py-3 font-medium tracking-wider">
                  Client Name
                </th>
                <th scope="col" className="px-6 py-3 font-medium tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 font-medium tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 font-medium tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 font-medium tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-800">{client.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                      {client.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                      {client.phone}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDepartmentBadgeColor(client.department)}`}>
                      <MdBusiness className="mr-1" />
                      {client.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="text-gray-500 hover:text-blue-600 transition duration-150 hover:bg-blue-50 p-1.5 rounded-md"
                        title="Edit Client"
                      >
                        <MdEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client._id, client.name)}
                        className="text-gray-500 hover:text-red-600 transition duration-150 hover:bg-red-50 p-1.5 rounded-md"
                        title="Delete Client"
                        disabled={loading}
                      >
                        <MdDelete className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 bg-white h-full flex items-center justify-center">
            <div>
              <p className="text-gray-500 text-lg">No clients found matching your search criteria</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-sky-600 hover:text-sky-800 underline"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientTable;