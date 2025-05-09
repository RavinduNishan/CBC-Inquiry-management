import mongoose from "mongoose";

const inquirySchema = mongoose.Schema(
    {
        inquiryID: { type: String, required: true, unique: true },
        client: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Client', 
            required: true 
        },
        category: { type: String, required: true },
        subject: { type: String, required: true },
        attachments: [String],
        message: { type: String, required: true },
        status: { type: String, default: "pending" },
        // Replace string comments with an array of comment objects
        comments: [{
            text: { type: String, required: true },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            userName: { type: String },
            createdAt: { type: Date, default: Date.now }
        }],
        priority: { type: String, required: true },
        assigned: { 
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: { type: String }
        },
        createdBy: { type: String, required: true }
    },
    { timestamps: true }
);

export default mongoose.model("Inquiry", inquirySchema);

