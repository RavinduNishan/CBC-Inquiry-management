import dotenv from 'dotenv';
dotenv.config();

// Export values from environment variables
export const MONGODBURL = process.env.MONGODB_URL;
export const PORT = process.env.PORT || 5555;
export const JWT_SECRET = process.env.JWT_SECRET || 'DefaultSecretForDevOnly-DoNotUseInProduction!123';

// Email configuration from environment
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;

// Log a warning if using default JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: Using default JWT_SECRET. This is not secure for production.');
}