// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const { authMiddleware } = require('../middleware/authMiddleware');

// // Combined endpoint for both user and admin password reset
// router.put('/reset-password', authMiddleware, async (req, res) => {
//   try {
//     const { currentPassword, newPassword, userId, isAdminReset } = req.body;
    
//     // If it's an admin reset (has userId and isAdminReset flag)
//     if (isAdminReset && userId) {
//       // Check if the requesting user is an admin
//       if (req.user.accessLevel !== 'Administrator') {
//         return res.status(403).json({ message: 'Not authorized. Admin privileges required.' });
//       }
      
//       // Find the user to reset password
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
      
//       // Hash the new password
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(newPassword, salt);
      
//       // Update user's password
//       user.password = hashedPassword;
//       await user.save();
      
//       return res.status(200).json({ message: 'Password reset successfully' });
//     } 
//     // Regular user resetting their own password
//     else {
//       // ...existing code for regular user password reset...
//       // This would validate currentPassword and update the user's own password
//     }
//   } catch (error) {
//     console.error('Password reset error:', error);
//     res.status(500).json({ message: 'Server error during password reset' });
//   }
// });

// // Admin password set endpoint (completely separate from regular password reset)
// router.post('/:id/set-password', authMiddleware, async (req, res) => {
//   try {
//     const { newPassword } = req.body;
//     const userId = req.params.id;
    
//     // Validate input
//     if (!newPassword) {
//       return res.status(400).json({ message: 'New password is required' });
//     }
    
//     // Check admin rights
//     if (req.user.accessLevel !== 'Administrator') {
//       return res.status(403).json({ message: 'Not authorized. Admin privileges required.' });
//     }
    
//     // Find user
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);
    
//     // Save the new password
//     user.password = hashedPassword;
//     await user.save();
    
//     return res.status(200).json({ message: 'Password set successfully' });
//   } catch (error) {
//     console.error('Admin set password error:', error);
//     res.status(500).json({ message: 'Server error during password update' });
//   }
// });

// module.exports = router;
