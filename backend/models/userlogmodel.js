import mongoose from "mongoose";

const userLogSchema = mongoose.Schema(
    {
        macAddress: { 
            type: String, 
            required: true 
        },
        userEmail: { 
            type: String, 
            required: true 
        },
        department: { 
            type: String, 
            required: true,
            enum: ['CBC', 'CBI', 'M~Line'] 
        },
        description: { 
            type: String, 
            required: true 
        },
        // Explicit createdAt field
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { 
        // Disable automatic timestamps to prevent updatedAt field
        timestamps: false 
    }
);

export default mongoose.model("UserLog", userLogSchema);
