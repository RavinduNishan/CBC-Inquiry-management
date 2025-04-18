import mongoose from "mongoose";

const userschema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        accessLevel: { type: String, required: true},
        permissions: [String],
        status: {type: String},
        password: { type:String },
        profileVersion: { type: Number, default: 1 },
        lastSecurityUpdate: { type: Date }
    },
    { timestamps: true }
);

export default mongoose.model("User", userschema);

