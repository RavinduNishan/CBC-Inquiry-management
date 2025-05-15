import Client from "../models/clientmodel.js";

// Controller for creating a new client
export const createClient = async (req, res) => {
    try {
        if (
            !req.body.name ||
            !req.body.email ||
            !req.body.phone ||
            !req.body.department
        ) {
            return res.status(400).send({ message: "All required fields must be provided." });
        }

        // Validate phone number - ensure it contains only digits
        if (!/^\d+$/.test(req.body.phone)) {
            return res.status(400).send({ message: "Phone number must contain only digits." });
        }
        
        // Check if the user is authorized to create a client with this department
        const userDepartment = req.user?.department;
        
        // Enhanced admin check that looks at both isAdmin flag and accessLevel property
        const isAdmin = req.user?.isAdmin === true || req.user?.accessLevel === 'admin';
        
        // If user is not admin and trying to create client for different department
        if (!isAdmin && userDepartment && req.body.department !== userDepartment) {
            return res.status(403).send({ 
                message: "You can only create clients for your own department." 
            });
        }

        // Create new client
        const newClient = await Client.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            department: req.body.department
        });

        return res.status(201).json({
            message: `Client created successfully`,
            client: newClient
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
};

// Controller for getting all clients
export const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find({});
        return res.status(200).json({
          success: true,
          count: clients.length,
          data: clients
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
};

// Controller for getting clients formatted for dropdown selection
export const getClientsForDropdown = async (req, res) => {
    try {
        const clients = await Client.find({}, 'name email phone department');
        
        // Format clients specifically for dropdown display
        const formattedClients = clients.map(client => ({
            _id: client._id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            department: client.department,
            // Add a displayName property that combines name and department for easier selection
            displayName: `${client.name} - ${client.department} (${client.email})`
        }));
        
        return res.status(200).json({
            success: true,
            count: formattedClients.length,
            data: formattedClients
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
};

// Controller for getting client by id
export const getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);

        if (!client) return res.status(404).json({ message: "Client not found" });

        return res.status(200).json(client);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
};

// Controller for updating a client
export const updateClient = async (req, res) => {
    try {
        // Validate phone number if it's being updated
        if (req.body.phone && !/^\d+$/.test(req.body.phone)) {
            return res.status(400).send({ message: "Phone number must contain only digits." });
        }
        
        // Get existing client to check department
        const existingClient = await Client.findById(req.params.id);
        if (!existingClient) {
            return res.status(404).json({ message: "Client not found" });
        }
        
        // Check if the user is authorized to update this client
        const userDepartment = req.user?.department;
        
        // Enhanced admin check that looks at both isAdmin flag and accessLevel property
        const isAdmin = req.user?.isAdmin === true || req.user?.accessLevel === 'admin';
        
        // Non-admin users can only update clients from their own department
        if (!isAdmin && userDepartment && existingClient.department !== userDepartment) {
            return res.status(403).send({ 
                message: "You can only update clients from your own department." 
            });
        }
        
        // Non-admin users cannot change the department
        if (!isAdmin && req.body.department && req.body.department !== userDepartment) {
            return res.status(403).send({ 
                message: "You cannot change a client's department." 
            });
        }

        // Use findByIdAndUpdate with the clean update object
        const client = await Client.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!client) return res.status(404).json({ message: "Client not found" });

        return res.status(200).json({
            message: "Client updated successfully",
            client: client
        });
    } catch (error) {
        console.error("Error updating client:", error.message);
        return res.status(500).send({ message: error.message });
    }
};

// Controller for deleting a client
export const deleteClient = async (req, res) => {
    try {
        // Get existing client to check department
        const existingClient = await Client.findById(req.params.id);
        if (!existingClient) {
            return res.status(404).json({ message: "Client not found" });
        }
        
        // Check if the user is authorized to delete this client
        const userDepartment = req.user?.department;
        
        // Enhanced admin check that looks at both isAdmin flag and accessLevel property
        const isAdmin = req.user?.isAdmin === true || req.user?.accessLevel === 'admin';
        
        // Non-admin users can only delete clients from their own department
        if (!isAdmin && userDepartment && existingClient.department !== userDepartment) {
            return res.status(403).send({ 
                message: "You can only delete clients from your own department." 
            });
        }
        
        const client = await Client.findByIdAndDelete(req.params.id);

        return res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
};
