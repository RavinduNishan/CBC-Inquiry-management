/**
 * Server-Sent Events (SSE) manager for real-time notifications
 */

// Map to store SSE clients for each user ID
const userConnections = new Map();

/**
 * Add a new client connection for a specific user
 * @param {string} userId - The user's ID
 * @param {object} res - Express response object to maintain the connection
 * @returns {boolean} - Whether the connection was successfully added
 */
function addUserConnection(userId, res) {
  if (!userId) return false;
  
  try {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering
    
    // Initialize user's connection set if it doesn't exist
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    
    // Add this response object to the user's connections
    userConnections.get(userId).add(res);
    
    // Send an initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);
    console.log(`User ${userId} connected to SSE. Active connections: ${userConnections.get(userId).size}`);
    
    return true;
  } catch (error) {
    console.error(`Error adding SSE connection for user ${userId}:`, error);
    return false;
  }
}

/**
 * Remove a client connection for a specific user
 * @param {string} userId - The user's ID
 * @param {object} res - Express response object to remove
 */
function removeUserConnection(userId, res) {
  if (!userId || !userConnections.has(userId)) return;
  
  try {
    // Remove this specific connection
    userConnections.get(userId).delete(res);
    console.log(`User ${userId} disconnected from SSE. Remaining connections: ${userConnections.get(userId).size}`);
    
    // If no more connections for this user, remove the user entry
    if (userConnections.get(userId).size === 0) {
      userConnections.delete(userId);
      console.log(`Removed all SSE connections for user ${userId}`);
    }
  } catch (error) {
    console.error(`Error removing SSE connection for user ${userId}:`, error);
  }
}

/**
 * Send a notification to a specific user across all their connections
 * @param {string} userId - The user's ID to notify
 * @param {string} type - The notification type (e.g. 'forceLogout', 'accountUpdate')
 * @param {string} message - The notification message
 * @returns {boolean} - Whether the notification was sent to at least one connection
 */
function notifyUser(userId, type, message) {
  if (!userId || !userConnections.has(userId)) {
    console.log(`No active SSE connections for user ${userId}`);
    return false;
  }
  
  const connections = userConnections.get(userId);
  const notification = { type, message, timestamp: new Date().toISOString() };
  let sentCount = 0;
  
  console.log(`Sending ${type} notification to user ${userId} (${connections.size} connections)`);
  
  connections.forEach(res => {
    try {
      res.write(`data: ${JSON.stringify(notification)}\n\n`);
      sentCount++;
    } catch (err) {
      console.error(`Error sending notification to a connection for user ${userId}:`, err);
      // Remove broken connection
      removeUserConnection(userId, res);
    }
  });
  
  console.log(`Sent ${type} notification to ${sentCount}/${connections.size} connections for user ${userId}`);
  return sentCount > 0;
}

/**
 * Get SSE middleware for Express
 * @returns {Function} - Express middleware function
 */
function getSseMiddleware() {
  return (req, res, next) => {
    // Add helper methods to the request object
    req.sse = {
      addUserConnection: (userId) => addUserConnection(userId, res),
      removeUserConnection: (userId) => removeUserConnection(userId, res),
      notifyUser,
    };
    next();
  };
}

// Export the module
module.exports = {
  addUserConnection,
  removeUserConnection,
  notifyUser,
  getSseMiddleware,
  userConnections // Export for testing/debugging
};
