import express from 'express';
import { createClient, getAllClients, getClientById, updateClient, deleteClient, getClientsForDropdown } from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes with authentication
router.post('/', createClient);
router.get('/', getAllClients);
// Specific routes must come before parameter routes
router.get('/dropdown', getClientsForDropdown);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;