import mongoose from "mongoose";

const userschema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        department: { type: String, required: true },
        status: {type: String},
        password: { type:String },
        accessLevel: { 
            type: String, 
            enum: ['admin', 'manager', 'staff'],
            default: 'staff'
        },
        profileVersion: { type: Number, default: 1 },
        lastSecurityUpdate: { type: Date },
        twoFactorEnabled: { type: Boolean, default: true } // Changed default to true
    },
    { timestamps: true }
);

export default mongoose.model("Users", userschema);

