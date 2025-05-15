import React, { useState, useContext, useEffect } from 'react';
import { MdEdit, MdDelete, MdBusiness } from 'react-icons/md';
import { BsSearch, BsDownload } from 'react-icons/bs';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import EditClient from './editclient';
import AuthContext from '../../context/AuthContext';

function ClientTable({ clients, fetchClients }) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [filteredClients, setFilteredClients] = useState([]);
  
  // Add state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // Apply filters whenever filter criteria change
  useEffect(() => {
    if (!clients) return;
    
    let filtered = [...clients];
    
    // Filter by user department if not admin
    if (user && !user.isAdmin) {
      filtered = filtered.filter(client => client.department === user.department);
    }
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter(client => client.department === departmentFilter);
    }
    
    setFilteredClients(filtered);
  }, [clients, user, searchTerm, departmentFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
  };
  
  // Function to handle deleting a client
  const handleDeleteClient = async (clientId, clientName) => {
    // Check if user has permission to delete this client
    const clientToDelete = clients.find(c => c._id === clientId);
    if (!user.isAdmin && clientToDelete && clientToDelete.department !== user.department) {
      enqueueSnackbar('Permission denied: Cannot delete clients from other departments', { variant: 'error' });
      return;
    }
    
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
    // Check if user has permission to edit this client
    if (!user.isAdmin && client.department !== user.department) {
      enqueueSnackbar('Permission denied: Cannot edit clients from other departments', { variant: 'error' });
      return;
    }
    
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

  // New function to get row highlight color based on department
  const getRowHighlightColor = (department) => {
    switch (department) {
      case 'CBC':
        return 'bg-blue-50 hover:bg-blue-100';
      case 'CBI':
        return 'bg-green-50 hover:bg-green-100';
      case 'M~Line':
        return 'bg-purple-50 hover:bg-purple-100';
      default:
        return 'hover:bg-gray-50';
    }
  };

  // Calculate department stats
  const getDepartmentStats = () => {
    if (!filteredClients || filteredClients.length === 0) return {};
    
    const stats = {
      total: filteredClients.length,
      departments: {}
    };
    
    filteredClients.forEach(client => {
      const dept = client.department || 'Unknown';
      stats.departments[dept] = (stats.departments[dept] || 0) + 1;
    });
    
    return stats;
  };
  
  const departmentStats = getDepartmentStats();

  // Generate CSV data from filtered clients
  const generateCSV = () => {
    // Define the headers
    const headers = [
      'Client Name', 'Email', 'Phone', 'Department', 'Created At', 'Updated At'
    ];
    
    // Create the CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data for each client
    filteredClients.forEach(client => {
      // Format dates for better readability
      const createdDate = client.createdAt ? new Date(client.createdAt).toLocaleString() : 'N/A';
      const updatedDate = client.updatedAt ? new Date(client.updatedAt).toLocaleString() : 'N/A';
      
      // Create CSV row and escape values that might contain commas
      const row = [
        `"${client.name || ''}"`,
        `"${client.email || ''}"`,
        `"${client.phone || ''}"`,
        `"${client.department || ''}"`,
        `"${createdDate}"`,
        `"${updatedDate}"`
      ].join(',');
      
      csvContent += row + '\n';
    });
    
    return csvContent;
  };
  
  // Download CSV file
  const downloadCSV = () => {
    const csvData = generateCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger the download
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `Clients-Export-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div className="flex space-x-1 flex-wrap">
              {user?.isAdmin && (
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
              )}
              
              {/* Department Stats - NEW */}
              {filteredClients.length > 0 && (
                <div className="flex items-center text-xs ml-2">
                  {Object.entries(departmentStats.departments).map(([dept, count]) => (
                    <div 
                      key={dept} 
                      className={`ml-2 px-2 py-1 rounded-md flex items-center ${
                        dept === 'CBC' ? 'bg-blue-100 text-blue-800' : 
                        dept === 'CBI' ? 'bg-green-100 text-green-800' : 
                        dept === 'M~Line' ? 'bg-purple-100 text-purple-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <MdBusiness className="mr-1" />
                      <span>{dept}: {count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Action Buttons - Fixed layout */}
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
              
              <button
                onClick={downloadCSV}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none text-sm font-medium flex items-center"
              >
                <BsDownload className="mr-1" /> CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Single scrollable container for the entire table - increased height */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-b-lg" style={{ height: 'calc(100% - 90px)' }}>
        {filteredClients.length === 0 ? (
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
        ) : (
          <div className="relative min-w-full">
            <table className="min-w-full border-collapse">
              {/* Table header - sticky relative to the scrollable container */}
              <thead className="sticky top-0 z-20">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                    Client Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                    Phone
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                    Department
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 sticky top-0 right-0 z-30 shadow-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr 
                    key={client._id} 
                    className={`border-b transition-colors ${getRowHighlightColor(client.department)}`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="font-medium text-gray-800">{client.name}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                        {client.email}
                      </a>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                        {client.phone}
                      </a>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDepartmentBadgeColor(client.department)}`}>
                        <MdBusiness className="mr-1" />
                        {client.department}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white shadow-lg z-10 border-l border-gray-100">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleEditClient(client)}
                          className="text-gray-500 hover:text-blue-600 transition duration-150 hover:bg-blue-50 p-1 rounded-md"
                          title="Edit Client"
                        >
                          <MdEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client._id, client.name)}
                          className="text-gray-500 hover:text-red-600 transition duration-150 hover:bg-red-50 p-1 rounded-md"
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
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientTable;