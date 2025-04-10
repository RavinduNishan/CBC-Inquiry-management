import express from "express";
import user from "../models/usermodel.js"; // Adjust the path as necessary
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { protect, admin } from "../middleware/authMiddleware.js";
import { JWT_SECRET } from "../config.js";  // Import JWT_SECRET from config

const router = express.Router();  

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {  // Use imported JWT_SECRET instead of hardcoded value
    expiresIn: '30d',
  });
};

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userFound = await user.findOne({ email });

    if (!userFound) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Return user data and token
    res.status(200).json({
      _id: userFound._id,
      name: userFound.name,
      email: userFound.email,
      phone: userFound.phone,
      accessLevel: userFound.accessLevel,
      status: userFound.status,
      token: generateToken(userFound._id)
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

// Get current user profile
router.get("/profile", protect, async (req, res) => {
  try {
    const userProfile = await user.findById(req.user._id).select('-password');
    
    if (userProfile) {
      res.status(200).json(userProfile);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

// Reset password endpoint - MOVED UP before the ID routes
router.put("/reset-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find the current user by ID
    const userFound = await user.findById(req.user._id);
    
    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, userFound.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    userFound.password = hashedPassword;
    await userFound.save();
    
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

//create a new user
router.post("/", async (req, res) => {
    try {
        if (
            !req.body.name ||
            !req.body.email ||
            !req.body.phone ||
            !req.body.accessLevel ||
            !req.body.permissions ||
            !req.body.password
        ) {
            return res.status(400).send({ message: "All required fields must be provided." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user
        const newUser = await user.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            accessLevel: req.body.accessLevel || "",
            permissions: req.body.permissions || [],
            status: req.body.status || "active",
            password: hashedPassword
        });

        return res.status(201).send(
            `User created successfully with ID: ${newUser._id}`
        );
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

//get all users
router.get("/", protect, async (req, res) => {
    try {
        const users = await user.find({});
        return res.status(200).json({
          success: true,
          count: users.length,
          data: users
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

//get users by id
router.get("/:id", protect, async (req, res) => {
    try {
        const User = await user.findById(req.params.id);

        if (!User) return res.status(404).json({ message: "user not found" });

        return res.status(200).json(User);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

//update an existing user
router.put("/:id", protect, async (req, res) => {
    try {
        const User = await user.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!User) return res.status(404).json({ message: "user not found" });

        return res.status(200).json({message: "user updated successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

// delete an user
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const User = await user.findByIdAndDelete(req.params.id);

        if (!User) return res.status(404).json({ message: "user not found" });

        return res.status(200).json({ message: "user deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

export default router;