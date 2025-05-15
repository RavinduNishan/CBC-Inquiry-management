import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } from '../config.js';
import dns from 'dns';
import net from 'net';

// ===== EMAIL TRANSPORT SETUP =====

// Create a transporter with proper debugging
const createTransporter = () => {
  // Check if email configuration is available
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    console.error('Email configuration is incomplete. Please check your .env file.');
    return null;
  }
  
  // Create transporter with enhanced settings for deliverability
  const transport = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    // Enhanced deliverability settings
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    },
    // Enable verbose logging
    debug: true,
    logger: true
  });
  
  // Log configuration for debugging
  console.log('Email transport configured with:', {
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: { user: EMAIL_USER ? `${EMAIL_USER.substring(0, 3)}...` : 'not set' }
  });
  
  return transport;
};

// Initialize transporter on module load
const transporter = createTransporter();

// ===== CONNECTION VERIFICATION =====

// Verify connection configuration
const verifyConnection = async () => {
  try {
    if (!transporter) {
      console.error('Cannot verify email connection: Transporter not initialized');
      return false;
    }
    
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection verification failed:', error);
    return false;
  }
};

// Initialize verification on module load
verifyConnection().then(isValid => {
  if (isValid) {
    console.log('Email service is ready to send emails');
  } else {
    console.warn('Email service is not properly configured - emails may not be delivered');
  }
});

// ===== EMAIL SENDING FUNCTIONS =====

/**
 * Send an email notification about a new inquiry to the inquiry submitter
 * @param {Object} data - Combined inquiry and client data
 * @returns {Promise} - Promise resolving to the sent mail info
 */
export const sendInquiryConfirmation = async (data) => {
  try {
    // Check if transporter is available
    if (!transporter) {
      console.error('Email transporter not initialized');
      return { success: false, message: 'Email service not configured' };
    }
    
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
    
    // Enhanced email headers to improve deliverability
    const fromAddress = EMAIL_FROM || `"CBC Inquiry System" <${EMAIL_USER}>`;
    
    // Define email content
    const mailOptions = {
      from: fromAddress,
      to: recipientEmail,
      subject: `Your Inquiry has been received [${data.inquiryID}]`,
      // Set priority headers
      priority: 'high',
      importance: 'high',
      // Add headers to reduce spam filtering
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        'X-Mailer': 'CBC Inquiry Management System'
      },
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
      `,
      // Add plain text alternative for better deliverability
      text: `
Inquiry Confirmation

Dear ${recipientName},

We have received your inquiry request and are processing it. Your information has been recorded in our system.

Here are the details of your inquiry:

Inquiry ID: ${data.inquiryID}
Name: ${recipientName}
Email: ${recipientEmail}
Phone: ${recipientPhone}
Department: ${recipientCompany}
Subject: ${data.subject}

Please keep this information for your reference. If you need to follow up on your inquiry, please mention the Inquiry ID.

This is an automated message from the CBC Inquiry Management System. Please do not reply to this email.
      `
    };

    console.log('Sending email with configuration:', {
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      user: EMAIL_USER ? EMAIL_USER.substring(0, 3) + '...' : 'not set',
      from: fromAddress
    });
    
    // Send the email with detailed error handling
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Confirmation email sent successfully:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      });
      
      // Check if the email was actually accepted by the server
      if (info.rejected && info.rejected.length > 0) {
        console.error('❌ Email was rejected for some recipients:', info.rejected);
        return { 
          success: false, 
          error: 'Email rejected by server', 
          details: info 
        };
      }
      
      return { 
        success: true, 
        messageId: info.messageId,
        details: info 
      };
    } catch (smtpError) {
      console.error('❌ SMTP error sending confirmation email:', smtpError);
      return { 
        success: false, 
        error: 'SMTP error: ' + smtpError.message,
        details: smtpError
      };
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send an email notification about a closed inquiry to the inquiry submitter
 * @param {Object} inquiry - The inquiry object with populated client
 * @returns {Promise} - Promise resolving to the sent mail info
 */
export const sendInquiryClosure = async (inquiry) => {
  try {
    // Check if transporter is available
    if (!transporter) {
      console.error('Email transporter not initialized');
      return { success: false, message: 'Email service not configured' };
    }
    
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
    
    // Format comments based on new array structure
    let commentsHtml = '';
    if (Array.isArray(inquiry.comments) && inquiry.comments.length > 0) {
      commentsHtml = `
        <p><strong>Comments:</strong></p>
        <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
          ${inquiry.comments.map(comment => `
            <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                <strong>${comment.userName || 'Staff'}</strong>
                <span style="color: #999;"> - ${new Date(comment.createdAt).toLocaleString()}</span>
              </p>
              <p style="margin: 5px 0 0 0;">${comment.text}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else if (typeof inquiry.comments === 'string' && inquiry.comments.trim()) {
      // Fallback for old string-based comments
      commentsHtml = `
        <p><strong>Comments:</strong></p>
        <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
          ${inquiry.comments.replace(/\n/g, '<br>')}
        </div>
      `;
    }
    
    // Define email content
    const mailOptions = {
      from: EMAIL_FROM || `"CBC Inquiry System" <${EMAIL_USER}>`,
      to: client.email,
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
          
          ${commentsHtml}
          
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
      user: EMAIL_USER ? EMAIL_USER.substring(0, 3) + '...' : 'not set'
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Closure email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending closure email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send an email with one-time password for password reset
 * @param {Object} data - Email recipient data with OTP
 * @returns {Promise} - Promise resolving to the sent mail info
 */
export const sendOtpEmail = async (data) => {
  try {
    // Check if transporter is available
    if (!transporter) {
      console.error('Email transporter not initialized');
      return { success: false, message: 'Email service not configured' };
    }
    
    const { email, name, otp, expiryMinutes = 15 } = data;
    
    if (!email || !otp) {
      console.error('Cannot send OTP email: Missing email or OTP', data);
      throw new Error('Missing required data for OTP email');
    }
    
    console.log(`Preparing to send OTP email to: ${email}`);
    
    // Enhanced email headers to improve deliverability
    const fromAddress = EMAIL_FROM || `"CBC Inquiry System" <${EMAIL_USER}>`;
    
    // Define email content with modern design
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: "Password Reset OTP - CBC Inquiry System",
      // Set priority headers
      priority: 'high',
      importance: 'high',
      // Add headers to reduce spam filtering
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        'X-Mailer': 'CBC Inquiry Management System'
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="background-color: #3b82f6; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="color: white; margin: 0;">Password Reset</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb; border-radius: 0 0 5px 5px;">
            <p>Dear ${name},</p>
            
            <p>We received a request to reset your password for the CBC Inquiry Management System. Please use the following One-Time Password (OTP) to verify your identity:</p>
            
            <div style="background-color: #ffffff; padding: 15px; border: 1px solid #e5e7eb; border-radius: 5px; margin: 20px 0; text-align: center;">
              <h2 style="font-size: 24px; letter-spacing: 5px; margin: 10px 0; color: #1f2937;">${otp}</h2>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">This OTP is valid for ${expiryMinutes} minutes only</p>
            </div>
            
            <p><strong>Important:</strong> If you did not request this password reset, please ignore this email or contact your system administrator.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>This is an automated message from the CBC Inquiry Management System. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `,
      // Add plain text alternative for better deliverability
      text: `
Password Reset OTP

Dear ${name},

We received a request to reset your password for the CBC Inquiry Management System. Please use the following One-Time Password (OTP) to verify your identity:

Your OTP: ${otp}

This OTP is valid for ${expiryMinutes} minutes only.

Important: If you did not request this password reset, please ignore this email or contact your system administrator.

This is an automated message from the CBC Inquiry Management System. Please do not reply to this email.
      `
    };

    console.log('Sending OTP email with configuration:', {
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      user: EMAIL_USER ? EMAIL_USER.substring(0, 3) + '...' : 'not set',
      from: fromAddress
    });
    
    // Send the email with detailed error handling
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      });
      
      // Check if the email was actually accepted by the server
      if (info.rejected && info.rejected.length > 0) {
        console.error('❌ OTP Email was rejected for some recipients:', info.rejected);
        return { 
          success: false, 
          error: 'Email rejected by server', 
          details: info 
        };
      }
      
      return { 
        success: true, 
        messageId: info.messageId,
        details: info 
      };
    } catch (smtpError) {
      console.error('❌ SMTP error sending OTP email:', smtpError);
      return { 
        success: false, 
        error: 'SMTP error: ' + smtpError.message,
        details: smtpError
      };
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// ===== EMAIL TESTING & DIAGNOSTICS =====

// Add a test function to verify email configuration
export const testEmailConfiguration = async () => {
  try {
    const configStatus = {
      host: EMAIL_HOST || 'NOT SET',
      port: EMAIL_PORT || 'NOT SET',
      user: EMAIL_USER ? 'SET' : 'NOT SET',
      pass: EMAIL_PASS ? 'SET' : 'NOT SET',
      from: EMAIL_FROM || 'NOT SET (will use user email)',
    };
    
    console.log('Email configuration status:', configStatus);
    
    // Check for missing configurations
    const missingConfigs = Object.entries(configStatus)
      .filter(([key, value]) => value === 'NOT SET' && key !== 'from') // from is optional
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

// Add a function to check email configuration and send test email
export const sendTestEmail = async (testEmailAddress) => {
  try {
    // Check if transporter is available
    if (!transporter) {
      return {
        success: false, 
        message: 'Email service not configured properly. Check your server configuration.'
      };
    }
    
    // Verify email configuration and connection
    const verifyResult = await verifyConnection();
    if (!verifyResult) {
      return {
        success: false,
        message: 'Failed to connect to email server. Check your configuration.'
      };
    }
    
    // Send a test email
    const testMailOptions = {
      from: EMAIL_FROM || `"CBC Inquiry System" <${EMAIL_USER}>`,
      to: testEmailAddress,
      subject: 'Test Email from CBC Inquiry Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Test Email</h2>
          <p>This is a test email from the CBC Inquiry Management System.</p>
          <p>If you received this email, it means your email configuration is working correctly.</p>
          <p>Email configuration details:</p>
          <ul>
            <li>Host: ${EMAIL_HOST}</li>
            <li>Port: ${EMAIL_PORT}</li>
            <li>Secure: ${EMAIL_PORT === 465 ? 'Yes' : 'No'}</li>
          </ul>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(testMailOptions);
    return {
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      message: `Failed to send test email: ${error.message}`,
      error: error.toString()
    };
  }
};

/**
 * Perform a detailed email delivery test to diagnose issues
 * @param {string} testEmail - Email address to test delivery to
 * @returns {Promise<Object>} - Test results
 */
export const runDeliveryTest = async (testEmail) => {
  try {
    console.log('Running email delivery test for:', testEmail);
    
    // First, check if email service is configured
    if (!transporter) {
      return {
        success: false,
        message: 'Email service not configured properly',
        details: {
          host: EMAIL_HOST ? 'SET' : 'MISSING',
          port: EMAIL_PORT ? 'SET' : 'MISSING',
          user: EMAIL_USER ? 'SET' : 'MISSING',
          pass: EMAIL_PASS ? 'SET' : 'MISSING'
        }
      };
    }
    
    // Test the connection
    let connectionStatus;
    try {
      connectionStatus = await verifyConnection();
      if (!connectionStatus) {
        return {
          success: false,
          message: 'Failed to connect to email server',
          stage: 'connection'
        };
      }
    } catch (connErr) {
      return {
        success: false,
        message: 'Error verifying connection: ' + connErr.message,
        stage: 'connection',
        error: connErr
      };
    }
    
    // Send a test email with detailed headers for debugging delivery issues
    const testMailOptions = {
      from: EMAIL_FROM || `"CBC System Test" <${EMAIL_USER}>`,
      to: testEmail,
      subject: 'CBC System Email Delivery Test',
      priority: 'high',
      headers: {
        'X-Test-Header': 'CBC-Delivery-Test',
        'X-Priority': '1'
      },
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Delivery Test</h2>
          <p>This is a test email to verify proper delivery from the CBC Inquiry System.</p>
          <p>If you're seeing this, email delivery is working!</p>
          <p>Test details:</p>
          <ul>
            <li>Time sent: ${new Date().toLocaleString()}</li>
            <li>Server: ${EMAIL_HOST}:${EMAIL_PORT}</li>
            <li>From: ${EMAIL_FROM || EMAIL_USER}</li>
          </ul>
          <p>This is an automated test message.</p>
        </div>
      `,
      text: `
Email Delivery Test

This is a test email to verify proper delivery from the CBC Inquiry System.
If you're seeing this, email delivery is working!

Test details:
- Time sent: ${new Date().toLocaleString()}
- Server: ${EMAIL_HOST}:${EMAIL_PORT}
- From: ${EMAIL_FROM || EMAIL_USER}

This is an automated test message.
      `
    };
    
    try {
      console.log('Sending test email...');
      const info = await transporter.sendMail(testMailOptions);
      
      console.log('Test email sent:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      });
      
      // Check if any recipients were rejected
      if (info.rejected && info.rejected.length > 0) {
        return {
          success: false,
          message: 'Email server rejected the recipient',
          stage: 'sending',
          details: info
        };
      }
      
      return {
        success: true,
        message: 'Test email sent successfully',
        details: {
          messageId: info.messageId,
          response: info.response
        },
        notes: [
          'Email was accepted by your mail server but might still be filtered by recipient',
          'Check the spam/junk folder of the recipient email',
          'Check with your email provider about any delivery issues'
        ]
      };
      
    } catch (sendErr) {
      console.error('Failed to send test email:', sendErr);
      return {
        success: false,
        message: 'Failed to send test email: ' + sendErr.message,
        stage: 'sending',
        error: sendErr
      };
    }
  } catch (error) {
    console.error('Error in delivery test:', error);
    return {
      success: false,
      message: 'Error in delivery test: ' + error.message,
      error
    };
  }
};

// ===== DIAGNOSTIC FUNCTIONS (Combined from emailDiagnostic.js) =====

/**
 * Check if email configuration is properly set
 * @returns {Promise<Object>} Configuration status
 */
export const checkEmailConfig = async () => {
  const config = {
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    user: EMAIL_USER,
    pass: EMAIL_PASS ? '[PASSWORD HIDDEN]' : undefined,
    from: EMAIL_FROM
  };
  
  const missingFields = Object.entries(config)
    .filter(([key, value]) => !value && key !== 'from') // from is optional
    .map(([key]) => key);
  
  return {
    configPresent: missingFields.length === 0,
    config: {
      ...config,
      pass: config.pass ? 'SET' : 'NOT SET'
    },
    missingFields
  };
};

/**
 * Check DNS records for email host
 * @param {string} host - Email host to check
 * @returns {Promise<Object>} DNS check results
 */
export const checkDNS = async (host) => {
  try {
    return new Promise((resolve) => {
      dns.lookup(host, (err, address) => {
        if (err) {
          resolve({
            success: false,
            error: err.message
          });
        } else {
          resolve({
            success: true,
            address
          });
        }
      });
    });
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if email server port is open
 * @param {string} host - Email host
 * @param {number} port - Email port
 * @returns {Promise<Object>} Port check results
 */
export const checkPort = async (host, port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;
    let error = null;
    
    // Set timeout to 5 seconds
    socket.setTimeout(5000);
    
    // Handle connection
    socket.on('connect', () => {
      status = true;
      socket.end();
    });
    
    // Handle error
    socket.on('error', (err) => {
      error = err.message;
    });
    
    // Handle timeout
    socket.on('timeout', () => {
      error = 'Connection timeout';
      socket.destroy();
    });
    
    // Handle close
    socket.on('close', () => {
      resolve({
        success: status,
        error
      });
    });
    
    // Connect to server
    socket.connect(port, host);
  });
};

/**
 * Run a complete email configuration diagnostic
 * @returns {Promise<Object>} Diagnostic results
 */
export const runDiagnostic = async () => {
  const configCheck = await checkEmailConfig();
  
  // If config is missing, return early
  if (!configCheck.configPresent) {
    return {
      success: false,
      config: configCheck,
      message: `Missing configuration: ${configCheck.missingFields.join(', ')}`
    };
  }
  
  // Check DNS
  const dnsCheck = await checkDNS(EMAIL_HOST);
  
  // Check port
  const portCheck = dnsCheck.success ? await checkPort(EMAIL_HOST, EMAIL_PORT) : {
    success: false,
    error: 'DNS lookup failed, skipping port check'
  };
  
  return {
    success: configCheck.configPresent && dnsCheck.success && portCheck.success,
    config: configCheck,
    dns: dnsCheck,
    port: portCheck,
    message: configCheck.configPresent && dnsCheck.success && portCheck.success 
      ? 'Email configuration appears valid'
      : 'Email configuration issues detected'
  };
};

/**
 * Handler for diagnostic API endpoint
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const handleDiagnosticRequest = async (req, res) => {
  try {
    const result = await runDiagnostic();
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to run email diagnostic',
      error: error.message
    });
  }
};
