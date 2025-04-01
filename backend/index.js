import express from "express";
import { PORT, MONGODBURL } from "./config.js";
import mongoose from "mongoose";
import Inquiry from "./models/inquirymodel.js";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
    console.log(req);
    return res.status(200).send("Welcome to CBC Inquiry Management");
});

app.post("/inquiry", async (req, res) => {
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

app.get("/inquiry", async (req, res) => {
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

app.get("/inquiry/:id", async (req, res) => {
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

app.put("/inquiry/:id", async (req, res) => {
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

app.delete("/inquiry/:id", async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

        if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

        return res.status(200).json({ message: "Inquiry deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});


// Database connection and server startup
mongoose.connect(MONGODBURL)
    .then(() => {
        console.log("MongoDB Connected...");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });