import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import inquiryRoutes from './routes/inquiryRoute.js';
import userRoutes from './routes/userRoute.js';
import { PORT, MONGODBURL } from './config.js';

const app = express();
const port = PORT || 5555;

// Middlewares
app.use(express.json());

// CORS configuration - fixed syntax errors
app.use(cors({
  // Allow both possible frontend URLs - Vite uses 5173, React default uses 3000
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Get current public IP address for MongoDB Atlas whitelisting instructions
const getPublicIp = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to fetch public IP:', error);
    return 'unknown';
  }
};

// MongoDB connection state tracking
let mongoConnectionState = {
  status: 'disconnected',
  error: null,
  attempts: 0,
  maxAttempts: 5,
  lastAttempt: null,
  publicIp: 'fetching...'
};

// Health check endpoint with detailed status
app.get('/api/health', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Health check requested from ${req.ip}`);
  
  // If public IP hasn't been fetched yet, try to get it
  if (mongoConnectionState.publicIp === 'fetching...') {
    mongoConnectionState.publicIp = await getPublicIp();
  }
  
  const mongoStatus = mongoose.connection.readyState;
  const statusLabels = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const status = {
    server: 'online',
    timestamp: new Date().toISOString(),
    mongodb: {
      status: statusLabels[mongoStatus] || 'unknown',
      details: mongoConnectionState,
      readyState: mongoStatus
    }
  };
  res.json(status);
});

// MongoDB connection setup with detailed error handling
const connectDB = async (retryCount = 5) => {
  mongoConnectionState.maxAttempts = retryCount;
  
  // Reset connection state
  mongoConnectionState = {
    ...mongoConnectionState,
    status: 'connecting',
    attempts: 0,
    error: null,
    lastAttempt: new Date().toISOString(),
  };
  
  // Get public IP for error messages
  try {
    mongoConnectionState.publicIp = await getPublicIp();
  } catch (err) {
    mongoConnectionState.publicIp = 'unknown';
  }
  
  while (mongoConnectionState.attempts < retryCount) {
    mongoConnectionState.attempts++;
    console.log(`MongoDB connection attempt ${mongoConnectionState.attempts}/${retryCount}...`);
    
    try {
      await mongoose.connect(MONGODBURL);
      console.log('MongoDB connection SUCCESS');
      mongoConnectionState.status = 'connected';
      mongoConnectionState.error = null;
      return true;
    } catch (error) {
      console.error('MongoDB connection FAILED. Retrying in 5 seconds...');
      console.error(error.message);
      
      // Store error details for frontend display messages
      mongoConnectionState.status = 'failed';
      mongoConnectionState.error = {
        message: error.message,
        type: error.name,
        code: error.code,
        timestamp: new Date().toISOString()
      };
      
      // Wait 5 seconds before retrying
      if (mongoConnectionState.attempts < retryCount) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  console.error(`Failed to connect to MongoDB after ${retryCount} attempts`);
  mongoConnectionState.status = 'exhausted';
  return false;
};

// Routes
app.use('/inquiry', inquiryRoutes);
app.use('/user', userRoutes);

// Expose MongoDB connection status via API
app.get('/api/mongodb/status', (req, res) => {
  res.json({
    ...mongoConnectionState,
    readyState: mongoose.connection.readyState
  });
});

// Add a route with MongoDB Atlas whitelisting instructions
app.get('/api/mongodb/whitelist-help', async (req, res) => {
  const ip = mongoConnectionState.publicIp || await getPublicIp();
  
  res.json({
    currentIp: ip,
    instructions: [
      "1. Log in to your MongoDB Atlas account at https://cloud.mongodb.com",
      "2. Select your project and cluster",
      "3. Click on 'Network Access' in the left sidebar",
      "4. Click the 'ADD IP ADDRESS' button",
      `5. Add your current IP address (${ip}) or use '0.0.0.0/0' to allow access from anywhere`,
      "6. Click 'Confirm' and wait a few minutes for the changes to take effect",
      "7. Restart your server application"
    ],
    links: {
      documentation: "https://www.mongodb.com/docs/atlas/security-whitelist/",
      atlas: "https://cloud.mongodb.com"
    }
  });
});

// Enhanced error handler for MongoDB connection issues
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'MongooseServerSelectionError' || 
      err.name === 'MongoNetworkError' ||
      (err.message && err.message.includes('MongoDB'))) {
    return res.status(503).json({
      message: 'Database connection error. Please try again later.',
      code: 'MONGODB_UNAVAILABLE',
      details: mongoConnectionState,
    });
  }
  res.status(500).json({
    message: 'Something went wrong!'
  });
});

// Start server with improved handling
connectDB()
  .then(connected => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}${!connected ? ' (LIMITED MODE - MongoDB unavailable)' : ''}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    app.listen(port, () => {
      console.log(`Server is running on port ${port} (ERROR MODE - MongoDB connection failed)`);
    });
  });