import express from "express";
import { PORT, MONGODBURL } from "./config.js";
import mongoose from "mongoose";

import cors from "cors";

import inquiryRoute from "./routes/inquiryRoute.js";
import inquirymodel from "./models/inquirymodel.js";


const app = express();

//Middleware to parse JSON bodies
app.use(express.json());
app.use(
    cors({
      origin: "http://localhost:5173", // Change this to match your frontend URL
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
app.get("/", (req, res) => {
    console.log(req);
    return res.status(200).send("Welcome to CBC Inquiry Management");
});


app.use('/inquiry', inquiryRoute);

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