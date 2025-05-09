import Inquiry from "../models/inquirymodel.js";
import Client from "../models/clientmodel.js";
import mongoose from "mongoose";
import { sendInquiryConfirmation, sendInquiryClosure } from "../utils/emailService.js";

// Helper function to generate the next inquiry ID
export async function generateInquiryID() {
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

// Controller for creating a new inquiry
export const createInquiry = async (req, res) => {
    try {
        if (
            !req.body.client ||
            !req.body.category ||
            !req.body.subject ||
            !req.body.message ||
            !req.body.priority ||
            !req.body.createdBy
        ) {
            return res.status(400).send({ message: "All required fields must be provided." });
        }

        // Validate if client exists
        const client = await Client.findById(req.body.client);
        if (!client) {
            return res.status(404).send({ message: "Selected client not found." });
        }

        // Generate the inquiry ID
        const inquiryID = await generateInquiryID();

        // Create new inquiry
        const newInquiry = await Inquiry.create({
            inquiryID: inquiryID,
            client: req.body.client,
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
            
            // Create a combined object with inquiry and client data for the email
            const emailData = {
                ...newInquiry.toObject(),
                // Add client fields directly for the email service
                name: client.name,
                email: client.email,
                phone: client.phone,
                company: client.department
            };
            
            await sendInquiryConfirmation(emailData);
            console.log('Inquiry confirmation email sent successfully');
            emailSent = true;
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Continue with the response even if email fails
        }

        return res.status(201).json({
            message: `Inquiry created successfully with ID: ${newInquiry.inquiryID}`,
            inquiry: newInquiry,
            emailSent: emailSent
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
};

// Controller for getting all inquiries
export const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({}).populate('client');
        return res.status(200).json({
          success: true,
          count: inquiries.length,
          data: inquiries
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
};

// Controller for getting inquiry by id
export const getInquiryById = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id).populate('client');

        if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

        return res.status(200).json(inquiry);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
};

// Controller for updating an existing inquiry
export const updateInquiry = async (req, res) => {
    try {
        console.log("Updating inquiry:", req.params.id);
        console.log("Received update data:", JSON.stringify(req.body));
        
        // Create a clean update object
        const updateData = {};
        
        // Copy simple fields
        if (req.body.status) updateData.status = req.body.status;
        
        // Handle new comment addition
        if (req.body.newComment) {
            // Find the current inquiry to get existing comments
            const currentInquiry = await Inquiry.findById(req.params.id);
            if (!currentInquiry) {
                return res.status(404).json({ message: "Inquiry not found" });
            }
            
            // Initialize comments array if it doesn't exist
            const existingComments = Array.isArray(currentInquiry.comments) ? currentInquiry.comments : [];
            
            // Add the new comment to the array
            const newComment = {
                text: req.body.newComment.text,
                userId: req.body.newComment.userId,
                userName: req.body.newComment.userName,
                createdAt: new Date()
            };
            
            updateData.comments = [...existingComments, newComment];
            console.log("Adding new comment:", newComment);
        }
        
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
                
                // First, find the updated inquiry and populate client information
                const updatedInquiry = await Inquiry.findById(req.params.id).populate('client');
                
                if (!updatedInquiry.client) {
                    console.error('Cannot send closure email: Client information not found');
                } else {
                    await sendInquiryClosure(updatedInquiry);
                    emailSent = true;
                    console.log('Inquiry closure email sent successfully');
                }
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
};

// Controller for deleting an inquiry
export const deleteInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

        if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

        return res.status(200).json({ message: "Inquiry deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
};
