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
 * @param {Object} data - Combined inquiry and client data
 * @returns {Promise} - Promise resolving to the sent mail info
 */
export const sendInquiryConfirmation = async (data) => {
  try {
    // Check if we have the client's email (either directly or from client object)
    const recipientEmail = data.email || data.client?.email;
    const recipientName = data.name || data.client?.name;
    const recipientPhone = data.phone || data.client?.phone;
    const recipientCompany = data.company || data.client?.department;
    
    if (!recipientEmail) {
      console.error('Cannot send email: No recipient email address found', data);
      throw new Error('No recipient email address found');
    }
    
    console.log('Preparing to send email confirmation to:', recipientEmail);
    
    // Define email content
    const mailOptions = {
      from: EMAIL_FROM,
      to: recipientEmail, // Send to the email from client data
      subject: `Your Inquiry has been received [${data.inquiryID}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Inquiry Confirmation</h2>
          
          <p>Dear ${recipientName},</p>
          
          <p>We have received your inquiry request and are processing it. Your information has been recorded in our system.</p>
          
          <p>Here are the details of your inquiry:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Inquiry ID:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${data.inquiryID}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${recipientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${recipientEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Phone:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${recipientPhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Department:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${recipientCompany}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Subject:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${data.subject}</td>
            </tr>
          </table>
          
          <p>Please keep this information for your reference. If you need to follow up on your inquiry, please mention the Inquiry ID.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated message from the CBC Inquiry Management System. Please do not reply to this email.
          </p>
        </div>
      `
    };

    console.log('Sending email with configuration:', {
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      user: EMAIL_USER?.substring(0, 5) + '...' || 'not set', // Log partial email for security
      from: EMAIL_FROM || 'not set'
    });
    
    // Validate essential email configuration
    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
      console.error('Email configuration incomplete:', {
        hostSet: !!EMAIL_HOST,
        portSet: !!EMAIL_PORT,
        userSet: !!EMAIL_USER,
        passSet: !!EMAIL_PASS,
        fromSet: !!EMAIL_FROM
      });
      throw new Error('Email configuration is incomplete');
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

/**
 * Send an email notification about a closed inquiry to the inquiry submitter
 * @param {Object} inquiry - The inquiry object with populated client
 * @returns {Promise} - Promise resolving to the sent mail info
 */
export const sendInquiryClosure = async (inquiry) => {
  try {
    // First, ensure the client is populated
    const populatedInquiry = inquiry.client && typeof inquiry.client === 'object' 
      ? inquiry
      : await inquiry.populate('client');
    
    const client = populatedInquiry.client;
    
    if (!client || !client.email) {
      console.error('Cannot send closure email: No client or client email found:', 
        { inquiryId: inquiry._id, clientId: inquiry.client });
      throw new Error('Client email not available for closure email');
    }
    
    console.log('Preparing to send inquiry closure email to:', client.email);
    
    // Define email content
    const mailOptions = {
      from: EMAIL_FROM,
      to: client.email, // Send to the client's email
      subject: `Your Inquiry [${inquiry.inquiryID}] has been closed`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Inquiry Closure Notification</h2>
          
          <p>Dear ${client.name},</p>
          
          <p>Your inquiry with ID <strong>${inquiry.inquiryID}</strong> has been closed. Thank you for reaching out to us.</p>
          
          <p>Here is a summary of your inquiry:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Subject:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${inquiry.subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Category:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${inquiry.category}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea; font-weight: bold;">Status:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">Closed</td>
            </tr>
          </table>
          
          ${inquiry.comments ? `
          <p><strong>Comments:</strong></p>
          <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
            ${inquiry.comments.replace(/\n/g, '<br>')}
          </div>
          ` : ''}
          
          <p>If you have any further questions, please feel free to submit a new inquiry or contact our support team.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated message from the CBC Inquiry Management System. Please do not reply to this email.
          </p>
        </div>
      `
    };

    console.log('Sending closure email with configuration:', {
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      user: EMAIL_USER?.substring(0, 5) + '...' || 'not set'
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Closure email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending closure email:', error);
    throw error;
  }
};

// Add a test function to verify email configuration
export const testEmailConfiguration = async () => {
  try {
    const configStatus = {
      host: EMAIL_HOST || 'NOT SET',
      port: EMAIL_PORT || 'NOT SET',
      user: EMAIL_USER ? 'SET' : 'NOT SET',
      pass: EMAIL_PASS ? 'SET' : 'NOT SET',
      from: EMAIL_FROM || 'NOT SET',
    };
    
    console.log('Email configuration status:', configStatus);
    
    // Check for missing configurations
    const missingConfigs = Object.entries(configStatus)
      .filter(([_, value]) => value === 'NOT SET')
      .map(([key]) => key);
      
    if (missingConfigs.length > 0) {
      console.error(`Missing email configurations: ${missingConfigs.join(', ')}`);
      return {
        status: 'error',
        message: `Missing configurations: ${missingConfigs.join(', ')}`,
        config: configStatus
      };
    }
    
    // Try to verify the connection
    const verified = await verifyConnection();
    return {
      status: verified ? 'success' : 'error',
      message: verified ? 'Email configuration verified successfully' : 'Failed to verify email configuration',
      config: configStatus
    };
  } catch (error) {
    console.error('Error testing email configuration:', error);
    return {
      status: 'error',
      message: error.message,
      error: error.toString()
    };
  }
};
