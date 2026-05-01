import ExternalIntegration from "../models/ExternalModel.js";
import WebhookLog from "../models/webhookModel.js";
import { sendWebhook } from "./webhookService.js";

export const triggerWebhook = async (event, data) => {
    const integrations = await ExternalIntegration.find({
        isActive: true,
        events: event
    });

    for (const integration of integrations) {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            data,
            meta: {
                source: "crm-system",
                version: "1.0"
            }
        };

        const log = await WebhookLog.create({
            integrationId: integration._id,
            event,
            url: integration.url,
            apiKey: integration.apiKey, // 👈 IMPORTANT FIX (you missed this)
            payload,
            status: "pending"
        });

        await sendWebhook(integration.apiKey,log, integration.url);
    }
};