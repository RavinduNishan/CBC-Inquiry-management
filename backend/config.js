import dotenv from 'dotenv';
dotenv.config();

// Define database constants
const MONGODB_HOST = 'inquiry.ojuojk0.mongodb.net';
const MONGODB_DATABASE = 'Inquirycollection';
const REQUIRED_COLLECTIONS = ['inquiries', 'users'];

// Get MongoDB URI from env, or use default with correct database name
let mongoUri = process.env.MONGODB_URI ;

// Ensure the connection string includes the database name
if (!mongoUri.includes(`/${MONGODB_DATABASE}?`)) {
  // If URI doesn't specify database, insert it before query parameters
  const parts = mongoUri.split('?');
  if (parts[0].endsWith('/')) {
    mongoUri = `${parts[0]}${MONGODB_DATABASE}?${parts[1] || ''}`;
  } else {
    mongoUri = `${parts[0]}/${MONGODB_DATABASE}?${parts[1] || ''}`;
  }
  console.log(`MongoDB URI modified to include database name: ${MONGODB_DATABASE}`);
}

// Export the correctly formatted MongoDB URL
export const MONGODBURL = mongoUri;

// Export values from environment variables
export const PORT = process.env.PORT || 5555;
export const JWT_SECRET = process.env.JWT_SECRET || 'DefaultSecretForDevOnly-DoNotUseInProduction!123';

// Email configuration from environment
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;

// Database validation configuration
export const DB_VALIDATION = {
  expectedDBName: MONGODB_DATABASE,
  requiredCollections: REQUIRED_COLLECTIONS
};

// Log a warning if using default JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: Using default JWT_SECRET. This is not secure for production.');
}