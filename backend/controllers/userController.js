import users from "../models/usermodel.js"; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { format } from 'date-fns';
// Import email service to send OTP emails
import { sendOtpEmail } from "../utils/emailService.js";

// Map to store SSE clients for each user ID
const userConnections = new Map();

// Map to store OTP information for password reset
const otpStore = new Map();

// Generate OTP function
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

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

// Function to notify a user about account changes - improved reliability
export function notifyUserOfAccountChange(userId, type, message) {
  if (!userConnections.has(userId)) {
    console.log(`No active connections for users${userId} to send ${type} notification`);
    return false;
  }
  
  const connections = userConnections.get(userId);
  const notification = { 
    type, 
    message, 
    timestamp: new Date().toISOString() 
  };
  
  console.log(`Sending ${type} notification to users${userId}, active connections: ${connections.size}`);
  
  let successCount = 0;
  connections.forEach(res => {
    try {
      // Format properly for SSE
      res.write(`data: ${JSON.stringify(notification)}\n\n`);
      successCount++;
    } catch (err) {
      console.error(`Failed to send notification to users${userId}:`, err);
    }
  });
  
  console.log(`Successfully sent ${type} notification to ${successCount}/${connections.size} connections`);
  return successCount > 0;
}

// Controller for SSE notifications endpoint
export const getUserNotifications = (req, res) => {
  const userId = req.user._id.toString();
  
  console.log(`users${userId} connected to notifications endpoint`);
  
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
  console.log(`users${userId} added to notifications. Active connections: ${userConnections.get(userId).size}`);
  
  // Handle client disconnection
  req.on('close', () => {
    if (userConnections.has(userId)) {
      console.log(`users${userId} disconnected from notifications`);
      userConnections.get(userId).delete(res);
      
      if (userConnections.get(userId).size === 0) {
        console.log(`Removing empty connection set for users${userId}`);
        userConnections.delete(userId);
      }
    }
  });
};

// Controller for user login
export const login = async (req, res) => {
  try {
    console.log("Login attempt received:", JSON.stringify(req.body, null, 2));
    
    // Check for required fields
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log("Missing email or password in login request");
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Normalize email (trim and lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    console.log(`Searching for user with normalized email: ${normalizedEmail}`);
    
    // Check if user exists (case-insensitive search)
    const userFound = await users.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });

    // Debug - log all users if none found
    if (!userFound) {
      console.log(`Login failed: No user found with email ${email}`);
      
      // For debugging: Check if the collection has any users at all
      const allUsers = await users.find({}, { email: 1 });
      console.log(`Available users in database: ${allUsers.length}`);
      console.log(`User emails: ${allUsers.map(u => u.email).join(', ')}`);
      
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`User found: ${userFound._id} (${userFound.email})`);

    // Check if user is active
    if (userFound.status === 'inactive') {
      console.log(`Login failed: User ${email} is inactive`);
      return res.status(401).json({ message: "Your account is inactive. Please contact an administrator." });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      console.log(`Login failed: Invalid password for user ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create token with a more reliable JWT_SECRET value
    const token = generateToken(userFound._id);
    
    console.log(`Login successful for user: ${email}`);

    // Return user data and token
    res.status(200).json({
      _id: userFound._id,
      name: userFound.name,
      email: userFound.email,
      phone: userFound.phone,
      department: userFound.department,
      status: userFound.status,
      accessLevel: userFound.accessLevel || 'staff', // Include access level in response
      profileVersion: userFound.profileVersion || 1,
      token: token
    });
  } catch (error) {
    console.log("Login error:", error.message, error.stack);
    return res.status(500).send({ message: error.message });
  }
};

// Controller for get current user profile
export const getProfile = async (req, res) => {
  try {
    const userProfile = await users.findById(req.user._id).select('-password');
    
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
};

// Controller for reset password
export const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find the current user by ID
    const userFound = await users.findById(req.user._id);
    
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
};

// Controller for admin set password
export const adminSetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.params.id;
    
    // No need to check for admin here since we've added the adminOnly middleware
    // This check is now handled in the route definition
    
    // Validate input
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    // Find the user to reset password
    const userToUpdate = await users.findById(userId);
    
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
    
    // Send immediate logout notification if the user is currently logged in
    const notificationSent = notifyUserOfAccountChange(
      userId,
      'forceLogout',
      'Your password has been reset by an administrator. Please log in with your new password.'
    );
    
    console.log(`Password reset notification sent: ${notificationSent}`);
    
    return res.status(200).json({ 
      message: 'Password updated successfully',
      profileVersion: userToUpdate.profileVersion,
      notificationSent
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

// Controller for create user
export const createUser = async (req, res) => {
  try {
    if (
        !req.body.name ||
        !req.body.email ||
        !req.body.phone ||
        !req.body.department ||
        !req.body.password
    ) {
        return res.status(400).send({ message: "All required fields must be provided." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user with access level
    const newUser = await users.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        department: req.body.department,
        status: req.body.status || "active",
        accessLevel: req.body.accessLevel || "staff", // Set access level or default to 'staff'
        password: hashedPassword
    });

    return res.status(201).send(
        `User created successfully with ID: ${newUser._id}`
    );
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

// Controller for get all users - Updated to filter results for managers
export const getAllUsers = async (req, res) => {
  try {
    // Check if requesting user is admin or manager
    const isAdmin = req.user.accessLevel === 'admin';
    const isManager = req.user.accessLevel === 'manager';
    const userDepartment = req.user.department;
    
    let allUsers;
    
    if (isAdmin) {
      // Admins can see all users
      allUsers = await users.find({});
    } else if (isManager && userDepartment) {
      // Managers can only see:
      // 1. All admins
      // 2. Other managers and staff from their own department
      allUsers = await users.find({
        $or: [
          { accessLevel: 'admin' },
          { department: userDepartment }
        ]
      });
    } else {
      // Fallback - shouldn't normally happen due to middleware
      return res.status(403).json({ message: "Insufficient permissions to view users" });
    }
    
    return res.status(200).json({
      success: true,
      count: allUsers.length,
      data: allUsers
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

// Controller for get user by id
export const getUserById = async (req, res) => {
  try {
    const user = await users.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "user not found" });

    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleString('en-US', dateOptions) : 'N/A';

    return res.status(200).json({ ...user._doc, createdDate });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

// Controller for update user
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get the user before update to compare changes
    const existingUser = await users.findById(userId);
    if (!existingUser) return res.status(404).json({ message: "User not found" });
    
    // Detect which critical fields are changing
    const criticalFieldsChanged = {
      email: req.body.email && req.body.email !== existingUser.email,
      name: req.body.name && req.body.name !== existingUser.name,
      department: req.body.department && req.body.department !== existingUser.department,
      status: req.body.status && req.body.status !== existingUser.status,
      accessLevel: req.body.accessLevel && req.body.accessLevel !== existingUser.accessLevel // Add access level to critical fields
    };
    
    // If any critical fields changed, increment profileVersion
    const securityChanged = Object.values(criticalFieldsChanged).some(changed => changed);
    
    // Update profile version if security-related fields changed
    if (securityChanged) {
      req.body.profileVersion = (existingUser.profileVersion || 0) + 1;
      req.body.lastSecurityUpdate = new Date();
    }
    
    // Update user
    const updatedUser = await users.findByIdAndUpdate(
      userId,
      req.body,
      { new: true }
    );

    // Send immediate logout notification if security was changed 
    // and the user being updated is not the current user
    if (securityChanged && userId !== req.user._id.toString()) {
      console.log(`Critical security changes detected for users${userId}. Sending force logout notification.`);
      
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
};

// Controller for delete user
export const deleteUser = async (req, res) => {
  try {
    const userToDelete = await users.findById(req.params.id);

    if (!userToDelete) return res.status(404).json({ message: "user not found" });

    // Send a notification to force logout before deletion if the user is currently logged in
    notifyUserOfAccountChange(
      req.params.id,
      'forceLogout',
      'Your account has been deleted by an administrator.'
    );
    
    // Delete the user
    await users.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "user deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

// Controller for API status check
export const checkApiStatus = async (req, res) => {
  try {
    // Count users to verify database connection without exposing data
    const userCount = await users.countDocuments();
    
    return res.status(200).json({
      status: "API is operational",
      message: "Authentication required for protected endpoints",
      authInstructions: "Include 'Authorization: Bearer YOUR_TOKEN_HERE' header with requests",
      databaseConnection: "Connected",
      userCount
    });
  } catch (error) {
    console.log("API check error:", error.message);
    return res.status(500).json({ 
      status: "API error", 
      databaseConnection: "Failed",
      message: error.message 
    });
  }
};

// Controller for initiating forgot password process
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Normalize email (trim and lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    
    // Find user by email (case-insensitive)
    const userFound = await users.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
    
    // If no user found with this email, don't reveal this information
    // Instead, pretend we sent an email for security reasons
    if (!userFound) {
      console.log(`Forgot password requested for non-existent email: ${normalizedEmail}`);
      return res.status(200).json({ 
        message: "If your email is registered, you will receive a password reset OTP" 
      });
    }
    
    // Check if user is active
    if (userFound.status === 'inactive') {
      return res.status(400).json({ 
        message: "This account is inactive. Please contact an administrator." 
      });
    }
    
    // Generate OTP
    const otp = generateOTP(6);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
    
    // Store OTP with user information
    otpStore.set(normalizedEmail, {
      otp,
      expiry: otpExpiry,
      userId: userFound._id,
      attempts: 0
    });
    
    console.log(`Generated OTP for ${normalizedEmail}: ${otp}`);
    
    // Send OTP via email
    await sendOtpEmail({
      email: normalizedEmail,
      name: userFound.name,
      otp,
      expiryMinutes: 15
    });
    
    return res.status(200).json({
      message: "Password reset OTP has been sent to your email",
      expiresIn: "15 minutes"
    });
  } catch (error) {
    console.log("Forgot password error:", error.message, error.stack);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Controller to verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    
    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if OTP exists for this email
    if (!otpStore.has(normalizedEmail)) {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }
    
    // Get OTP data
    const otpData = otpStore.get(normalizedEmail);
    
    // Check if OTP has expired
    if (new Date() > otpData.expiry) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }
    
    // Increment attempts
    otpData.attempts += 1;
    
    // Check if max attempts exceeded (5 attempts)
    if (otpData.attempts > 5) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." });
    }
    
    // Check if OTP matches
    if (otpData.otp !== otp) {
      return res.status(400).json({ 
        message: "Invalid OTP",
        attemptsLeft: 5 - otpData.attempts
      });
    }
    
    // OTP is valid! Generate a temporary token for password reset
    const resetToken = jwt.sign(
      { id: otpData.userId, purpose: 'reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // Clear OTP data since it's been verified
    otpStore.delete(normalizedEmail);
    
    return res.status(200).json({
      message: "OTP verified successfully",
      resetToken
    });
  } catch (error) {
    console.log("Verify OTP error:", error.message, error.stack);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Controller to reset password using reset token
export const resetPasswordWithToken = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    // Validate inputs
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Reset token and new password are required" });
    }
    
    // Verify the reset token
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    
    // Check if token is for password reset purpose
    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ message: "Invalid reset token" });
    }
    
    // Find the user
    const userFound = await users.findById(decoded.id);
    
    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password and increment profileVersion
    userFound.password = hashedPassword;
    userFound.profileVersion = (userFound.profileVersion || 0) + 1;
    userFound.lastSecurityUpdate = new Date();
    
    await userFound.save();
    
    // Notify user of password change if they're logged in
    notifyUserOfAccountChange(
      decoded.id,
      'forceLogout',
      'Your password has been reset. Please log in with your new password.'
    );
    
    return res.status(200).json({ 
      message: "Password reset successful",
      profileVersion: userFound.profileVersion
    });
  } catch (error) {
    // Handle JWT verification errors specifically
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    console.log("Reset password error:", error.message, error.stack);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
