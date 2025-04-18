import express from "express";
import user from "../models/usermodel.js"; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { protect, admin } from "../middleware/authMiddleware.js";
import { JWT_SECRET } from "../config.js";
import { format } from 'date-fns';

const router = express.Router();  

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'PPP p');
};

// Map to store SSE clients for each user ID
const userConnections = new Map();

// Add a new SSE endpoint to receive notifications
router.get("/notifications", protect, (req, res) => {
  const userId = req.user._id.toString();
  
  console.log(`User ${userId} connected to notifications endpoint`);
  
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Disable proxy buffering
  });
  
  // Send an initial connection test message
  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);
  
  // Store the connection in the map
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  
  userConnections.get(userId).add(res);
  console.log(`User ${userId} added to notifications. Active connections: ${userConnections.get(userId).size}`);
  
  // Handle client disconnection
  req.on('close', () => {
    if (userConnections.has(userId)) {
      console.log(`User ${userId} disconnected from notifications`);
      userConnections.get(userId).delete(res);
      
      if (userConnections.get(userId).size === 0) {
        console.log(`Removing empty connection set for user ${userId}`);
        userConnections.delete(userId);
      }
    }
  });
});

// Function to notify a user about account changes - improved reliability
function notifyUserOfAccountChange(userId, type, message) {
  if (!userConnections.has(userId)) {
    console.log(`No active connections for user ${userId} to send ${type} notification`);
    return false;
  }
  
  const connections = userConnections.get(userId);
  const notification = { 
    type, 
    message, 
    timestamp: new Date().toISOString() 
  };
  
  console.log(`Sending ${type} notification to user ${userId}, active connections: ${connections.size}`);
  
  let successCount = 0;
  connections.forEach(res => {
    try {
      // Format properly for SSE
      res.write(`data: ${JSON.stringify(notification)}\n\n`);
      successCount++;
    } catch (err) {
      console.error(`Failed to send notification to user ${userId}:`, err);
    }
  });
  
  console.log(`Successfully sent ${type} notification to ${successCount}/${connections.size} connections`);
  return successCount > 0;
}

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userFound = await user.findOne({ email });

    if (!userFound) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is active
    if (userFound.status === 'inactive') {
      return res.status(401).json({ message: "Your account is inactive. Please contact an administrator." });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create token with a more reliable JWT_SECRET value
    const token = generateToken(userFound._id);

    // Return user data and token
    res.status(200).json({
      _id: userFound._id,
      name: userFound.name,
      email: userFound.email,
      phone: userFound.phone,
      accessLevel: userFound.accessLevel,
      permissions: userFound.permissions || [],
      status: userFound.status,
      profileVersion: userFound.profileVersion || 1,
      token: token
    });
  } catch (error) {
    console.log("Login error:", error.message);
    return res.status(500).send({ message: error.message });
  }
});

// Get current user profile
router.get("/profile", protect, async (req, res) => {
  try {
    const userProfile = await user.findById(req.user._id).select('-password');
    
    if (userProfile) {
      // Include the profileVersion field in the response
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
    
    // Update the password and set requiresRelogin flag
    userFound.password = hashedPassword;
    userFound.profileVersion = (userFound.profileVersion || 0) + 1;
    userFound.lastSecurityUpdate = new Date();
    
    await userFound.save();
    
    res.status(200).json({ 
      message: "Password updated successfully",
      requiresRelogin: true,
      profileVersion: userFound.profileVersion
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
});

// Admin set password endpoint - add this new route
router.post("/:id/set-password", protect, admin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.params.id;
    
    // Validate input
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    // Find the user to reset password
    const userToUpdate = await user.findById(userId);
    
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user's password and increment profileVersion
    userToUpdate.password = hashedPassword;
    userToUpdate.profileVersion = (userToUpdate.profileVersion || 0) + 1;
    userToUpdate.lastSecurityUpdate = new Date();
    
    await userToUpdate.save();
    
    return res.status(200).json({ 
      message: 'Password updated successfully',
      profileVersion: userToUpdate.profileVersion
    });
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

        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        const createdDate = User.createdAt ? new Date(User.createdAt).toLocaleString('en-US', dateOptions) : 'N/A';

        return res.status(200).json({ ...User._doc, createdDate });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

//update an existing user
router.put("/:id", protect, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get the user before update to compare changes
    const existingUser = await user.findById(userId);
    if (!existingUser) return res.status(404).json({ message: "User not found" });
    
    // Detect which critical fields are changing
    const criticalFieldsChanged = {
      email: req.body.email && req.body.email !== existingUser.email,
      name: req.body.name && req.body.name !== existingUser.name,
      accessLevel: req.body.accessLevel && req.body.accessLevel !== existingUser.accessLevel,
      status: req.body.status && req.body.status !== existingUser.status,
      // Check if permissions have changed
      permissions: req.body.permissions && JSON.stringify(req.body.permissions) !== JSON.stringify(existingUser.permissions)
    };
    
    // If any critical fields changed, increment profileVersion
    const securityChanged = Object.values(criticalFieldsChanged).some(changed => changed);
    
    // Update profile version if security-related fields changed
    if (securityChanged) {
      req.body.profileVersion = (existingUser.profileVersion || 0) + 1;
      req.body.lastSecurityUpdate = new Date();
    }
    
    // Update user
    const updatedUser = await user.findByIdAndUpdate(
      userId,
      req.body,
      { new: true }
    );

    // Send immediate logout notification if security was changed 
    // and the user being updated is not the current user
    if (securityChanged && userId !== req.user._id.toString()) {
      console.log(`Critical security changes detected for user ${userId}. Sending force logout notification.`);
      
      // Try to notify the user immediately
      const notificationSent = notifyUserOfAccountChange(
        userId,
        'forceLogout',
        'Your account has been updated by an administrator. Please log in again with your updated credentials.'
      );
      
      // Log the notification result
      console.log(`Force logout notification sent: ${notificationSent}`);
    }

    return res.status(200).json({
      message: "User updated successfully",
      requiresRelogin: securityChanged,
      profileVersion: updatedUser.profileVersion,
      notificationSent: true,
      // Include which fields changed to help client decide what to do
      changedFields: Object.entries(criticalFieldsChanged)
        .filter(([_, changed]) => changed)
        .map(([field]) => field)
    });
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