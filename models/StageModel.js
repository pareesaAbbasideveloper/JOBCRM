import mongoose from "mongoose";

const stageSchema = new mongoose.Schema({
    name: {
        type: String
    },
    color: {
        type: String
    },
    order: {            // 👈 THIS IS IMPORTANT
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model("Stage", stageSchema);