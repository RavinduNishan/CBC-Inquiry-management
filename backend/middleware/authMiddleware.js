import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js';
import { JWT_SECRET } from '../config.js';

export const protect = async (req, res, next) => {
  let token;
  const isSSERequest = req.headers.accept && req.headers.accept.includes('text/event-stream');
  
  try {
    // Get token from headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from Bearer token string
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      if (isSSERequest) {
        // For SSE requests, send a properly formatted SSE error message
        res.writeHead(401, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Not authorized, no token' })}\n\n`);
        res.end();
        return;
      }
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      if (isSSERequest) {
        res.writeHead(401, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'User not found' })}\n\n`);
        res.end();
        return;
      }
      return res.status(401).json({ message: 'User not found' });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    if (isSSERequest) {
      res.writeHead(401, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Not authorized, token invalid' })}\n\n`);
      res.end();
      return;
    }
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

export default protect;
