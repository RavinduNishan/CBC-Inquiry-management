import users from "../models/usermodel.js";

// Middleware to protect routes for admin access only
export const adminOnly = async (req, res, next) => {
  try {
    // User is already authenticated from the protect middleware
    // We just need to check if they're an admin
    const user = await users.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.accessLevel !== 'admin') {
      console.log(`Access denied: User ${user._id} (${user.name}) attempted to access admin route`);
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    
    // User is an admin, proceed
    next();
  } catch (error) {
    console.error('Admin middleware error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
