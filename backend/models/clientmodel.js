import mongoose from "mongoose";

const clientSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        department: { type: String, required: true, enum: ['CBC', 'CBI', 'M~Line'] }
    },
    { timestamps: true }
);

export default mongoose.model("Client", clientSchema);