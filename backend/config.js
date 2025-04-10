// Remove the dotenv import and config call
// import dotenv from 'dotenv';
// dotenv.config();

// Export direct values without relying on process.env
export const MONGODBURL = 'mongodb+srv://nishravindu:pass@inquiry.ojuojk0.mongodb.net/Inquirycollection?retryWrites=true&w=majority&appName=Inquiry';
export const PORT = 5555;
export const JWT_SECRET = 'mysecretkey123'; // Replace with a more secure secret in production

// Email configuration for Gmail
export const EMAIL_HOST = 'smtp.gmail.com';
export const EMAIL_PORT = 587;
export const EMAIL_USER = 'nish.ravindu@gmail.com';
export const EMAIL_PASS = 'dcvyzyvhctfcebjk'; // Your app password
export const EMAIL_FROM = 'CBC Inquiry System <nish.ravindu@gmail.com>';