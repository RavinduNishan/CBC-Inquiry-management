import UserLog from "../models/userlogmodel.js";
import { getMacAddress } from "../utils/networkUtils.js";

// Get all user logs
export const getAllUserLogs = async (req, res) => {
  try {
    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Allow filtering by department
    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department;
    }
    
    // Allow search in description
    if (req.query.search) {
      filter.description = { $regex: req.query.search, $options: 'i' };
    }
    
    // Allow filtering by date range
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Get total count for pagination
    const total = await UserLog.countDocuments(filter);
    
    // Get logs with sorting (newest first)
    const logs = await UserLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: logs
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

// Create new log entry
export const createUserLog = async (req, res) => {
  try {
    const { userEmail, department, description } = req.body;
    
    if (!userEmail || !department || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Get MAC address from request or use a default
    const macAddress = req.macAddress || await getMacAddress() || "unknown";
    
    const newLog = await UserLog.create({
      macAddress,
      userEmail,
      department,
      description
    });
    
    return res.status(201).json({
      success: true,
      data: newLog
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

// Internal function to create log from anywhere in the app
export const logUserAction = async (data) => {
  try {
    const { userEmail, department, description, macAddress } = data;
    
    if (!userEmail || !department || !description) {
      console.error("Cannot log user action: Missing required fields");
      return null;
    }
    
    const newLog = await UserLog.create({
      macAddress: macAddress || "system",
      userEmail,
      department,
      description
    });
    
    return newLog;
  } catch (error) {
    console.error("Failed to log user action:", error.message);
    return null;
  }
};

// Log user login actions
export const logLoginAction = async (user) => {
  try {
    const macAddress = await getMacAddress();
    return await logUserAction({
      userEmail: user.email,
      department: user.department,
      description: `User logged in:`,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log login action:", error.message);
    return null;
  }
};

// Log password change actions
export const logPasswordChange = async (userEmail, department, changedByAdmin = false, adminEmail = null) => {
  try {
    const macAddress = await getMacAddress();
    
    // Use consistent description format regardless of who changed it
    const description = `User Password changed: ${userEmail}`;
    
    // Record actor's email (who modified the password)
    const actorEmail = changedByAdmin ? adminEmail : userEmail;
    
    return await logUserAction({
      userEmail: actorEmail, // This is who performed the action
      department,
      description, // This always shows whose password was changed
      macAddress
    });
  } catch (error) {
    console.error("Failed to log password change:", error.message);
    return null;
  }
};

// Log user creation
export const logUserCreation = async (creatorEmail, createdUserEmail, department, accessLevel) => {
  try {
    const macAddress = await getMacAddress();
    return await logUserAction({
      userEmail: creatorEmail,
      department,
      description: `Created new [${accessLevel || "staff"}] user: ${createdUserEmail}`,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log user creation:", error.message);
    return null;
  }
};

// Log user update
export const logUserUpdate = async (updaterEmail, updatedUserEmail, department, accessLevel) => {
  try {
    const macAddress = await getMacAddress();
    return await logUserAction({
      userEmail: updaterEmail,
      department,
      description: `Updated [${accessLevel}] user: ${updatedUserEmail}`,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log user update:", error.message);
    return null;
  }
};

// Log user deletion
export const logUserDeletion = async (deleterEmail, deletedUserEmail, department, accessLevel) => {
  try {
    const macAddress = await getMacAddress();
    return await logUserAction({
      userEmail: deleterEmail,
      department,
      description: `Deleted user: ${deletedUserEmail} `,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log user deletion:", error.message);
    return null;
  }
};

// Log password recovery
export const logPasswordRecovery = async (userEmail, department) => {
  try {
    const macAddress = await getMacAddress();
    return await logUserAction({
      userEmail: userEmail,
      department,
      description: `User password recovered: ${userEmail}`,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log password recovery:", error.message);
    return null;
  }
};

// Log client creation
export const logClientCreation = async (userEmail, clientEmail, department) => {
  try {
    const macAddress = await getMacAddress();
    return await logUserAction({
      userEmail,
      department,
      description: `Client created: ${clientEmail}`,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log client creation:", error.message);
    return null;
  }
};

// Log client update
export const logClientUpdate = async (userEmail, clientEmail, department) => {
  try {
    const macAddress = await getMacAddress();
    return await logUserAction({
      userEmail,
      department,
      description: `Client updated: ${clientEmail}`,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log client update:", error.message);
    return null;
  }
};

// Log client deletion
export const logClientDeletion = async (userEmail, clientEmail, department) => {
  try {
    const macAddress = await getMacAddress();
    return await logUserAction({
      userEmail,
      department,
      description: `Client deleted: ${clientEmail}`,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log client deletion:", error.message);
    return null;
  }
};

// Log inquiry creation
export const logInquiryCreation = async (userEmail, clientEmail, inquiryId, department, assignedUserEmail = null) => {
  try {
    const macAddress = await getMacAddress();
    let description = `Inquiry ${inquiryId} created for ${clientEmail}`;
    
    if (assignedUserEmail) {
      description += ` - assigned to ${assignedUserEmail}`;
    }
    
    return await logUserAction({
      userEmail,
      department,
      description,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log inquiry creation:", error.message);
    return null;
  }
};

// Log inquiry assignment
export const logInquiryAssignment = async (userEmail, inquiryId, department, assignedUserEmail) => {
  try {
    const macAddress = await getMacAddress();
    return await logUserAction({
      userEmail,
      department,
      description: `User ${assignedUserEmail} assigned to inquiry ${inquiryId}`,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log inquiry assignment:", error.message);
    return null;
  }
};

// Log inquiry comment
export const logInquiryComment = async (userEmail, inquiryId, department) => {
  try {
    const macAddress = await getMacAddress();
    return await logUserAction({
      userEmail,
      department,
      description: `Commented on inquiry ${inquiryId}`,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log inquiry comment:", error.message);
    return null;
  }
};

// Log inquiry closure
export const logInquiryClosure = async (userEmail, inquiryId, department) => {
  try {
    const macAddress = await getMacAddress();
    return await logUserAction({
      userEmail,
      department,
      description: `Inquiry ${inquiryId} closed`,
      macAddress
    });
  } catch (error) {
    console.error("Failed to log inquiry closure:", error.message);
    return null;
  }
};
