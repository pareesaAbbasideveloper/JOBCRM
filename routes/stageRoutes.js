import express from "express";
import {
    createStage,
    updateStage,
    deleteStage,
    getAllStages,
    updateStageOrder
} from "../controllers/stageController.js";

import { isVerifiedUser } from "../middlewares/tokenVerification.js";

const router = express.Router();

router.put("/stages/reorder", isVerifiedUser(["Admin"]), updateStageOrder);

router.get(
    "/stages",
    isVerifiedUser(["Admin", "User"]),
    getAllStages
);
// Create Stage
router.post(
    "/stages",
    isVerifiedUser(["Admin"]),
    createStage
);

// Update Stage
router.put(
    "/stages/:stageId",
    isVerifiedUser(["Admin"]),
    updateStage
);

// Delete Stage
router.delete(
    "/stages/:stageId",
    isVerifiedUser(["Admin"]),
    deleteStage
);

export default router;