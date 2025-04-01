import express from "express";
import Inquiry from "../models/inquirymodel.js";
const router = express.Router();  


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

        // Create new inquiry
        const newInquiry = await Inquiry.create({
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

        return res.status(201).send(
            `Inquiry created successfully with ID: ${newInquiry._id}`
        );
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
        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

        return res.status(200).json(inquiry);
    } catch (error) {
        console.log(error.message);
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