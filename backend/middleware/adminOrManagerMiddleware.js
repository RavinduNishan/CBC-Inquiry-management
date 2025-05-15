/**
 * Middleware to restrict route access to admins and department managers only
 */
export const adminOrManagerOnly = (req, res, next) => {
  // Check if user exists and has the required access level
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, no user found' });
  }
  
  const isAdmin = req.user.accessLevel === 'admin' || req.user.isAdmin === true;
  const isManager = req.user.accessLevel === 'manager';
  
  if (isAdmin || isManager) {
    // Allow access for admin or manager
    next();
  } else {
    // Deny access for other roles
    res.status(403).json({ 
      message: 'Not authorized, admin or manager access required',
      accessLevel: req.user.accessLevel
    });
  }
};
