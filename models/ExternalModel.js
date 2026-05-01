import mongoose from "mongoose";

const externalIntegrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    apiKey: {
        type: String
    },
    events: [
        {
            type: String,
            enum: [
                "lead_created",
                "lead_updated",
                "lead_stage_update",
                "lead_closed",
            ]
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model("ExternalIntegration", externalIntegrationSchema);