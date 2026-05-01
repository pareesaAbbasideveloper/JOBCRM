import express from "express";
import {
    createIntegration,
    getIntegrations,
    getIntegrationById,
    updateIntegration,
    deleteIntegration
} from "../controllers/externalController.js";

import { isVerifiedUser } from "../middlewares/tokenVerification.js";

const router = express.Router();

// Create Integration
router.post(
    "/integrations",
    isVerifiedUser(["Admin"]),
    createIntegration
);

// Get All Integrations
router.get(
    "/integrations",
    isVerifiedUser(["Admin"]),
    getIntegrations
);

// Get Single Integration
router.get(
    "/integrations/:id",
    isVerifiedUser(["Admin"]),
    getIntegrationById
);

// Update Integration
router.put(
    "/integrations/:id",
    isVerifiedUser(["Admin"]),
    updateIntegration
);

// Delete Integration
router.delete(
    "/integrations/:id",
    isVerifiedUser(["Admin"]),
    deleteIntegration
);

export default router;