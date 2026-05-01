import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema({
  integrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExternalIntegration"
  },
  event: String,
  url: String,

  payload: Object,

  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  },

  responseCode: Number,
  responseBody: String,

  retryCount: {
    type: Number,
    default: 0
  },

  nextRetryAt: Date
}, { timestamps: true });

export default mongoose.model("WebhookLog", webhookLogSchema);