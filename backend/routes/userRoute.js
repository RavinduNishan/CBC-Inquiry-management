import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
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

// Admin set password endpoint
router.post("/:id/set-password", protect, admin, adminSetPassword);

// Create a new user
router.post("/", createUser);

// Get all users
router.get("/", protect, getAllUsers);

// Get user by id
router.get("/:id", protect, getUserById);

// Update an existing user
router.put("/:id", protect, updateUser);

// Delete a user
router.delete("/:id", protect, admin, deleteUser);

export default router;