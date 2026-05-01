import express from "express";
import connectDB from "./config/database.js";
import config from "./config/config.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";
// 🔥 ROUTES
import leadRoute from "./routes/leadRoute.js";
import accountsRoute from "./routes/acountRoutes.js";
import stageRoute from "./routes/stageRoutes.js";
import externalIntegrationRoute from "./routes/externalRoute.js";
import { retryWebhookJob } from "./jobs/retryWebhookJob..js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = config.port || 5000;
// setInterval(retryWebhookJob, 600000); // every 1 min
/**
 * 🔐 MIDDLEWARES
 */

// ✅ CORS (cleaned)
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://althariocrm.netlify.app",
        "https://jobcrm.netlify.app"
    ],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

/**
 * 🏠 ROOT
 */
app.get("/", (req, res) => {
    res.json({ message: "🚀 POS + CRM Server Running" });
});

/**
 * 📦 API ROUTES
 */
app.use("/api/lead", leadRoute);
app.use("/api/stage", stageRoute); // ✅ NEW
app.use("/api/integration", externalIntegrationRoute); // ✅ NEW
// app.use("/api/upload", uploadingRoute);
app.use("/api/account", accountsRoute);


app.use(globalErrorHandler);


const startServer = async () => {
    try {
        await connectDB();
        console.log("☑️ Database Connected");


        app.listen(PORT, () => {
            console.log(`☑️ Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
