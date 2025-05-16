import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { getAllUserLogs, createUserLog } from "../controllers/userLogController.js";
import { captureMacAddress } from "../utils/networkUtils.js";

const router = express.Router();  

// Apply middleware for all routes
router.use(protect);
router.use(adminOnly); // Only admins can access user logs
router.use(captureMacAddress); // Try to capture MAC address from requests

// Get all user logs with pagination and filtering
router.get("/", getAllUserLogs);

// Create new log entry (for testing purposes)
router.post("/", createUserLog);

export default router;
