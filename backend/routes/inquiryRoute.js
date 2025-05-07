import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry
} from "../controllers/inquiryController.js";
import { testEmailConfiguration } from "../utils/emailService.js";

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

// Test email configuration
router.get("/test/email-config", async (req, res) => {
  try {
    const result = await testEmailConfiguration();
    res.status(result.status === 'success' ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to test email configuration',
      error: error.message
    });
  }
});

export default router;