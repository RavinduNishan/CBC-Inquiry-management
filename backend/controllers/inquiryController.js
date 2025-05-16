import Inquiry from "../models/inquirymodel.js";
import Client from "../models/clientmodel.js";
import mongoose from "mongoose";
import { sendInquiryConfirmation, sendInquiryClosure } from "../utils/emailService.js";
import { 
    logInquiryCreation, 
    logInquiryAssignment, 
    logInquiryComment, 
    logInquiryClosure 
} from "./userLogController.js";
import users from "../models/usermodel.js";  // Add this import to fetch user emails

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
        console.log('Create inquiry request body:', req.body);
        
        // Validate required fields
        if (
            !req.body.client ||
            !req.body.category ||
            !req.body.subject ||
            !req.body.message ||
            !req.body.priority ||
            !req.body.createdBy
        ) {
            console.error('Missing required fields in inquiry creation');
            return res.status(400).send({ 
                message: "All required fields must be provided.",
                missingFields: [
                    !req.body.client ? 'client' : null,
                    !req.body.category ? 'category' : null,
                    !req.body.subject ? 'subject' : null, 
                    !req.body.message ? 'message' : null,
                    !req.body.priority ? 'priority' : null,
                    !req.body.createdBy ? 'createdBy' : null
                ].filter(Boolean)
            });
        }

        // Validate if client exists and store for later use
        let clientData;
        try {
            clientData = await Client.findById(req.body.client);
            if (!clientData) {
                console.error('Client not found with ID:', req.body.client);
                return res.status(404).send({ message: "Selected client not found." });
            }
            
            // Department-based access control:
            // 1. Admins can create inquiries for any client
            // 2. Department managers/staff can only create inquiries for clients in their department
            const isAdmin = req.user?.accessLevel === 'admin';
            
            // Make sure we have user data before performing this check
            if (req.user && !isAdmin && req.user.department && req.user.department !== clientData.department) {
                console.error('Permission denied: User from department', req.user.department, 
                    'tried to create inquiry for client from department', clientData.department);
                return res.status(403).send({ 
                    message: "You can only create inquiries for clients in your department." 
                });
            }
        } catch (clientErr) {
            console.error('Error validating client:', clientErr);
            return res.status(400).send({ message: "Invalid client ID format or client not found." });
        }

        // Generate the inquiry ID
        const inquiryID = await generateInquiryID();
        
        // Ensure comments is an array
        const comments = Array.isArray(req.body.comments) ? req.body.comments : [];

        // Create new inquiry with properly structured data
        const newInquiry = await Inquiry.create({
            inquiryID,
            client: req.body.client,
            category: req.body.category,
            subject: req.body.subject,
            attachments: req.body.attachments || [], // Optional field
            message: req.body.message,
            status: req.body.status || "pending", // Default value
            comments: comments, // Ensure this is an array
            priority: req.body.priority,
            assigned: req.body.assigned || { userId: null, name: null }, // Initialize with empty structure
            createdBy: req.body.createdBy
        });

        // Get assigned user email if there is one
        let assignedUserEmail = null;
        if (req.body.assigned?.userId) {
            try {
                // Look up the assigned user's email from the database
                const assignedUser = await users.findById(req.body.assigned.userId);
                if (assignedUser) {
                    assignedUserEmail = assignedUser.email;
                } else {
                    // Fallback to name if user can't be found
                    assignedUserEmail = req.body.assigned.name;
                }
            } catch (error) {
                console.error("Error looking up assigned user:", error);
                // Fallback to name if there was an error
                assignedUserEmail = req.body.assigned.name;
            }
        }

        // Log the inquiry creation with the correct assigned user email
        await logInquiryCreation(
            req.user.email,
            clientData.email,
            inquiryID,
            clientData.department,
            assignedUserEmail
        );

        // Send email confirmation to the inquiry submitter
        let emailSent = false;
        try {
            console.log('Attempting to send email notification...');
            
            // Create a combined object with inquiry and client data for the email
            const emailData = {
                ...newInquiry.toObject(),
                // Add client fields directly from the validated clientData
                name: clientData.name,
                email: clientData.email,
                phone: clientData.phone,
                company: clientData.department
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
        console.error('Error creating inquiry:', error.message, error.stack);
        return res.status(500).send({ 
            message: "Server error while creating inquiry",
            error: error.message
        });
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
        
        // Find the current inquiry to get existing information
        const currentInquiry = await Inquiry.findById(req.params.id).populate('client');
        if (!currentInquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }

        // Store client data for logging
        const clientEmail = currentInquiry.client.email;
        const clientDepartment = currentInquiry.client.department;
        
        // Create a clean update object
        const updateData = {};
        
        // Copy simple fields
        if (req.body.status) updateData.status = req.body.status;
        
        // Handle new comment addition
        if (req.body.newComment) {
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
            
            // Log the comment action
            await logInquiryComment(
                req.user.email,
                currentInquiry.inquiryID,
                clientDepartment
            );
        }
        
        // Handle assigned user data
        if (req.body.assigned && req.body.assigned.userId) {
            try {
                // Validate the ObjectId format
                if (!mongoose.Types.ObjectId.isValid(req.body.assigned.userId)) {
                    return res.status(400).json({ 
                        message: "Invalid user ID format",
                        details: `Received: ${req.body.assigned.userId}`
                    });
                }
                
                // Check if assignment is new or changed
                const isNewAssignment = !currentInquiry.assigned?.userId || 
                    currentInquiry.assigned.userId.toString() !== req.body.assigned.userId.toString();
                
                if (isNewAssignment) {
                    // Get the assigned user's email
                    let assignedUserEmail = null;
                    try {
                        const assignedUser = await users.findById(req.body.assigned.userId);
                        if (assignedUser) {
                            assignedUserEmail = assignedUser.email;
                        } else {
                            assignedUserEmail = req.body.assigned.name;
                        }
                    } catch (err) {
                        console.error("Error looking up assigned user email:", err);
                        assignedUserEmail = req.body.assigned.name;
                    }
                    
                    // Set the entire assigned object
                    updateData.assigned = {
                        userId: req.body.assigned.userId,
                        name: req.body.assigned.name || "Unknown User",
                        email: assignedUserEmail || "unknown@email.com"
                    };
                    
                    console.log("Storing assigned user:", updateData.assigned);
                    
                    // Log the assignment action with the correct email
                    await logInquiryAssignment(
                        req.user.email,
                        currentInquiry.inquiryID,
                        clientDepartment,
                        assignedUserEmail || req.body.assigned.name
                    );
                }
            } catch (error) {
                console.error("Error processing assigned userId:", error.message);
                return res.status(400).json({ message: "Invalid user ID", details: error.message });
            }
        }
        
        // Check if status is changing to closed
        const isClosingInquiry = req.body.status === 'closed' && currentInquiry.status !== 'closed';
        
        console.log("Final update data:", JSON.stringify(updateData));
        
        // Use findByIdAndUpdate with the clean update object
        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

        console.log("Updated inquiry result:", inquiry);
        
        // Log if inquiry is being closed
        if (isClosingInquiry) {
            await logInquiryClosure(
                req.user.email,
                inquiry.inquiryID,
                clientDepartment
            );
        }
        
        // Check if inquiry is closed and email notification is requested
        let emailSent = false;
        if (isClosingInquiry && req.body.sendClosureEmail) {
            try {
                console.log('Sending closure email notification...');
                
                if (!currentInquiry.client) {
                    console.error('Cannot send closure email: Client information not found');
                } else {
                    await sendInquiryClosure(currentInquiry);
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
