import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js';
import { JWT_SECRET } from '../config.js';

const protect = async (req, res, next) => {
  let token;
  
  try {
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token exists
      if (!token) {
        console.log("No token found in request headers");
        return res.status(401).json({ message: 'Not authorized, token missing' });
      }
      
      try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Find the user
        const foundUser = await User.findById(decoded.id).select('-password');
        
        if (!foundUser) {
          console.log(`User not found for ID: ${decoded.id}`);
          return res.status(401).json({ message: 'User not found' });
        }
        
        // Check if user is active
        if (foundUser.status === 'inactive') {
          console.log(`Inactive user attempted access: ${foundUser._id}`);
          return res.status(401).json({ message: 'Your account has been deactivated' });
        }
        
        // Add user to request object
        req.user = foundUser;
        next();
      } catch (error) {
        console.log("Token verification error:", error.message);
        return res.status(401).json({ message: 'Not authorized, invalid token' });
      }
    } else {
      console.log("No Authorization header or Bearer token");
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: 'Server error in authentication' });
  }
};

export { protect };
