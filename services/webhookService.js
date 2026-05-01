import axios from "axios";

export const sendWebhook = async (integrationsApiKey,log, url) => {
    try {
        const res = await axios.post(url, log.payload, {
            headers: {
                "Content-Type": "application/json",
                "x-api-key": integrationsApiKey || ""
            },
            timeout: 5000
        });

        log.status = "success";
        log.responseCode = res.status;
        log.responseBody = JSON.stringify(res.data);
        await log.save();

    } catch (err) {
        log.retryCount += 1;

        if (log.retryCount < 3) {
            log.nextRetryAt = new Date(Date.now() + log.retryCount * 60000);
            log.status = "pending";
        } else {
            log.status = "failed";
        }

        log.responseBody = err.message;
        await log.save();
    }
};