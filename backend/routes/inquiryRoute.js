import express from "express";
import Inquiry from "../models/inquirymodel.js";
import { protect } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";
import { sendInquiryConfirmation, sendInquiryClosure } from "../utils/emailService.js";

const router = express.Router();  

// Apply protect middleware to all inquiry routes
router.use(protect);

// Helper function to generate the next inquiry ID
async function generateInquiryID() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // 01-12
    const day = today.getDate().toString().padStart(2, '0'); // 01-31
    
    const datePrefix = `${year}${month}${day}`;
    
    // Find the latest inquiry with the same date prefix
    const latestInquiry = await Inquiry.findOne(
        { inquiryID: new RegExp(`^${datePrefix}`) },
        { inquiryID: 1 }
    ).sort({ inquiryID: -1 });
    
    let nextNumber = 1; // Default start
    
    if (latestInquiry) {
        // Extract the counter part (last 4 digits)
        const latestCounter = parseInt(latestInquiry.inquiryID.slice(-4));
        nextNumber = latestCounter + 1;
    }
    
    // Format the counter as 4 digits with leading zeros
    const counter = nextNumber.toString().padStart(4, '0');
    return `${datePrefix}${counter}`;
}

//create a new inquiry
router.post("/", async (req, res) => {
    try {
        if (
            !req.body.name ||
            !req.body.email ||
            !req.body.phone ||
            !req.body.company ||
            !req.body.category ||
            !req.body.subject ||
            !req.body.message ||
            !req.body.priority ||
            !req.body.createdBy
        ) {
            return res.status(400).send({ message: "All required fields must be provided." });
        }

        // Generate the inquiry ID
        const inquiryID = await generateInquiryID();

        // Create new inquiry
        const newInquiry = await Inquiry.create({
            inquiryID: inquiryID,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            company: req.body.company,
            category: req.body.category,
            subject: req.body.subject,
            attachments: req.body.attachments || [], // Optional field
            message: req.body.message,
            status: req.body.status || "pending", // Default value
            comments: req.body.comments || "", // Optional field
            priority: req.body.priority,
            assigned: req.body.assigned || "",
            createdBy: req.body.createdBy
        });

        // Send email confirmation to the inquiry submitter
        let emailSent = false;
        try {
            console.log('Attempting to send email notification...');
            await sendInquiryConfirmation(newInquiry);
            console.log('Inquiry confirmation email sent successfully');
            emailSent = true;
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Continue with the response even if email fails
        }

        return res.status(201).json({
            message: `Inquiry created successfully with ID: ${newInquiry.inquiryID}`,
            emailSent: emailSent
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

//get all Inquiries
router.get("/", async (req, res) => {
    try {
        const inquiries = await Inquiry.find({});
        return res.status(200).json({
          success: true,
          count: inquiries.length,
          data: inquiries

        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

//get inquiries by id
router.get("/:id", async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);

        if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

        return res.status(200).json(inquiry);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

//update an existing inquiry
router.put("/:id", async (req, res) => {
    try {
        console.log("Updating inquiry:", req.params.id);
        console.log("Received update data:", JSON.stringify(req.body));
        
        // Create a clean update object
        const updateData = {};
        
        // Copy simple fields
        if (req.body.status) updateData.status = req.body.status;
        if (req.body.comments) updateData.comments = req.body.comments;
        
        // Handle assigned user data
        if (req.body.assigned) {
            if (req.body.assigned.userId) {
                try {
                    // Validate the ObjectId format
                    if (!mongoose.Types.ObjectId.isValid(req.body.assigned.userId)) {
                        return res.status(400).json({ 
                            message: "Invalid user ID format",
                            details: `Received: ${req.body.assigned.userId}`
                        });
                    }
                    
                    // Set the entire assigned object
                    updateData.assigned = {
                        userId: req.body.assigned.userId,
                        name: req.body.assigned.name || "Unknown User"
                    };
                    
                    console.log("Storing assigned user:", updateData.assigned);
                } catch (error) {
                    console.error("Error processing assigned userId:", error.message);
                    return res.status(400).json({ message: "Invalid user ID", details: error.message });
                }
            }
        }
        
        console.log("Final update data:", JSON.stringify(updateData));
        
        // Use findByIdAndUpdate with the clean update object
        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

        console.log("Updated inquiry result:", inquiry);
        
        // Check if inquiry is closed and email notification is requested
        let emailSent = false;
        if (updateData.status === 'closed' && req.body.sendClosureEmail) {
            try {
                console.log('Sending closure email notification...');
                await sendInquiryClosure(inquiry);
                emailSent = true;
                console.log('Inquiry closure email sent successfully');
            } catch (emailError) {
                console.error('Failed to send closure email:', emailError);
                // Continue with the response even if email fails
            }
        }

        return res.status(200).json({
            ...inquiry.toObject(),
            emailSent
        });
    } catch (error) {
        console.error("Error updating inquiry:", error.message);
        return res.status(500).send({ message: error.message });
    }
});

// delete an inquiry
router.delete("/:id", async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

        if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

        return res.status(200).json({ message: "Inquiry deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});


export default router;