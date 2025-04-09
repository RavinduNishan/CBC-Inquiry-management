import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } from '../config.js';

// Create a transporter with proper debugging
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  debug: true, // Show debug output
  logger: true // Log information
});

// Verify connection configuration
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    return false;
  }
};

// Initialize verification on module load
verifyConnection();

/**
 * Send an email notification about a new inquiry to the inquiry submitter
 * @param {Object} inquiry - The inquiry object with all details
 * @returns {Promise} - Promise resolving to the sent mail info
 */
export const sendInquiryConfirmation = async (inquiry) => {
  console.log('Preparing to send email confirmation to:', inquiry.email);
  
  // Define email content
  const mailOptions = {
    from: EMAIL_FROM,
    to: inquiry.email, // Send to the email provided in the inquiry form
    subject: `Your Inquiry has been received [${inquiry.inquiryID}]`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #333; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Inquiry Confirmation</h2>
        
        <p>Dear ${inquiry.name},</p>
        
        <p>We have received your inquiry request and are processing it. Your information has been recorded in our system.</p>
        
        <p>Here are the details of your inquiry:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Inquiry ID:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${inquiry.inquiryID}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${inquiry.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${inquiry.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Phone:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${inquiry.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Company:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${inquiry.company}</td>
          </tr>
        </table>
        
        <p>Please keep this information for your reference. If you need to follow up on your inquiry, please mention the Inquiry ID.</p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This is an automated message from the CBC Inquiry Management System. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    console.log('Sending email with configuration:', {
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      user: EMAIL_USER.substring(0, 5) + '...' // Log partial email for security
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};
