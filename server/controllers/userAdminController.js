const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Admin password reset controller
const adminResetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    
    // Validate inputs
    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'User ID and new password are required' });
    }
    
    // Check if the requesting user is an admin
    if (req.user.accessLevel !== 'Administrator') {
      return res.status(403).json({ message: 'Not authorized. Admin privileges required.' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user's password
    user.password = hashedPassword;
    await user.save();
    
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

module.exports = {
  adminResetPassword
};
