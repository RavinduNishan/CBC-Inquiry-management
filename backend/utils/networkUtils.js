import os from 'os';

// Function to get MAC address of the server
export const getMacAddress = async () => {
  try {
    const interfaces = os.networkInterfaces();
    
    for (const interfaceName in interfaces) {
      const iface = interfaces[interfaceName];
      
      // Find a non-internal interface with a MAC address
      const macAddress = iface.find(details => 
        !details.internal && details.mac && details.mac !== '00:00:00:00:00:00'
      );
      
      if (macAddress) {
        return macAddress.mac;
      }
    }
    
    return "unknown";
  } catch (error) {
    console.error("Error getting MAC address:", error.message);
    return "unknown";
  }
};

// Extract client IP from request
export const getClientIp = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress ||
         "unknown";
};

// Middleware to capture client MAC address if available
// Note: In most cases, MAC addresses cannot be obtained from HTTP requests
// due to network restrictions. This is a placeholder.
export const captureMacAddress = (req, res, next) => {
  // In real-world scenarios, this would only work in local network environments
  // or through specialized client-side scripts with permissions
  req.macAddress = req.headers['x-client-mac'] || "unknown"; 
  next();
};
