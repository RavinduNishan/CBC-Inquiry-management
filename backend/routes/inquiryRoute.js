import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry
} from "../controllers/inquiryController.js";

const router = express.Router();  

// Apply protect middleware to all inquiry routes
router.use(protect);

// Create a new inquiry
router.post("/", createInquiry);

// Get all inquiries
router.get("/", getAllInquiries);

// Get inquiry by id
router.get("/:id", getInquiryById);

// Update an existing inquiry
router.put("/:id", updateInquiry);

// Delete an inquiry
router.delete("/:id", deleteInquiry);

export default router;