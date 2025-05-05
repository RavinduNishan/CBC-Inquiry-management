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
        const client = await Client.findByIdAndDelete(req.params.id);

        if (!client) return res.status(404).json({ message: "Client not found" });

        return res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
};
