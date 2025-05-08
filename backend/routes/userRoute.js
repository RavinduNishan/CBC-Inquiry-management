import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  getUserNotifications,
  login,
  getProfile,
  resetPassword,
  adminSetPassword,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  checkApiStatus
} from "../controllers/userController.js";

const router = express.Router();  

// Public diagnostic route
router.get("/check", checkApiStatus);

// Add SSE endpoint to receive notifications
router.get("/notifications", protect, getUserNotifications);

// Login user
router.post("/login", login);

// Get current user profile
router.get("/profile", protect, getProfile);

// Reset password endpoint
router.put("/reset-password", protect, resetPassword);

// Admin set password endpoint - add admin middleware
router.post("/:id/set-password", protect, adminOnly, adminSetPassword);

// Create a new user - admin only
router.post("/", protect, adminOnly, createUser);

// Get all users - admin only
router.get("/", protect, adminOnly, getAllUsers);

// Get user by id - admin only
router.get("/:id", protect, adminOnly, getUserById);

// Update an existing user - admin only
router.put("/:id", protect, adminOnly, updateUser);

// Delete a user - admin only
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;