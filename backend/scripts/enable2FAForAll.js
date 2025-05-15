import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserModel from '../models/usermodel.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    updateAllUsers();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function updateAllUsers() {
  try {
    console.log('Starting to update all users...');
    
    // Update all users to have twoFactorEnabled = true
    const result = await UserModel.updateMany(
      { twoFactorEnabled: { $ne: true } }, // Only update users who don't already have it enabled
      { $set: { twoFactorEnabled: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} users to enable two-factor authentication`);
    console.log(`${result.matchedCount} users were checked in total`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    process.exit(0);
  }
}
