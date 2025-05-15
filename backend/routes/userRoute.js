import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { adminOrManagerOnly } from "../middleware/adminOrManagerMiddleware.js";
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
  checkApiStatus,
  forgotPassword,
  verifyOTP,
  resetPasswordWithToken
} from "../controllers/userController.js";

const router = express.Router();  

// Public diagnostic route
router.get("/check", checkApiStatus);

// Add SSE endpoint to receive notifications
router.get("/notifications", protect, getUserNotifications);

// Login user
router.post("/login", login);

// Add forgot password routes (public routes)
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password-token", resetPasswordWithToken);

// Get current user profile
router.get("/profile", protect, getProfile);

// Reset password endpoint
router.put("/reset-password", protect, resetPassword);

// Admin set password endpoint - add admin middleware
router.post("/:id/set-password", protect, adminOnly, adminSetPassword);

// Create a new user - admin only
router.post("/", protect, adminOnly, createUser);

// Get all users - UPDATED: allow both admins and managers
router.get("/", protect, adminOrManagerOnly, getAllUsers);

// Get user by id - admin only
router.get("/:id", protect, adminOnly, getUserById);

// Update an existing user - admin only
router.put("/:id", protect, adminOnly, updateUser);

// Delete a user - admin only
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;