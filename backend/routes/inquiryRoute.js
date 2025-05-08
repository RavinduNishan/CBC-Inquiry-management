import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry
} from "../controllers/inquiryController.js";
import { testEmailConfiguration, sendTestEmail, runDeliveryTest, runDiagnostic, handleDiagnosticRequest } from "../utils/emailService.js";

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

// Send test email
router.post("/test/send-email", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email address is required'
      });
    }
    
    const result = await sendTestEmail(email);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Run a comprehensive email delivery test
router.post("/test/email-delivery", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email address is required for delivery test'
      });
    }
    
    const result = await runDeliveryTest(email);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to run email delivery test',
      error: error.message
    });
  }
});

// Run comprehensive email diagnostics
router.get("/test/email-diagnostics", async (req, res) => {
  await handleDiagnosticRequest(req, res);
});

export default router;