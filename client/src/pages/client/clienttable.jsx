import React, { useState, useContext, useEffect } from 'react';
import { MdEdit, MdDelete, MdBusiness } from 'react-icons/md';
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
  
  // Filter clients based on user department when component mounts or clients/user changes
  useEffect(() => {
    if (user && clients) {
      if (user.isAdmin) {
        // Admins see all clients
        setFilteredClients(clients);
      } else {
        // Department managers see only their department's clients
        const departmentClients = clients.filter(client => client.department === user.department);
        setFilteredClients(departmentClients);
      }
    } else {
      setFilteredClients(clients || []);
    }
  }, [clients, user]);
  
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
    <div className="overflow-x-auto h-full">
      <div className="relative overflow-x-auto rounded-lg">
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
            {filteredClients && filteredClients.length > 0 ? (
              filteredClients.map((client) => (
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
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientTable;