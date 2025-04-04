import mongoose from "mongoose";

const inquirySchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        company: { type: String, required: true },
        category: { type: String, required: true },
        subject: { type: String, required: true },
        attachments: [String],
        message: { type: String, required: true },
        status: { type: String, default: "pending" },
        comments: { type: String},
        priority: { type: String, required: true },
        assigned: { type: String},
        createdBy: { type: String, required: true }
        
    },
    { timestamps: true }
);

export default mongoose.model("Inquiry", inquirySchema);

