import WebhookLog from "../models/webhookModel.js";
import { sendWebhook } from "../services/webhookService.js";

export const retryWebhookJob = async () => {
    const logs = await WebhookLog.find({
        status: "pending",
        nextRetryAt: { $lte: new Date() }
    });

    for (const log of logs) {
        await sendWebhook(log, log.url);
    }
};