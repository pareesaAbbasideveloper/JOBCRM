import express from "express";
import {
    getLeadStageCounts,
    createLead,
    updateLeadInfo,
    deleteLead,
    addNote,
    getNotes,
    updateNote,
    deleteNote,
    updateValue,
    getLeads,
    addValue,
    bulkUploadLeads
} from "../controllers/leadController.js";
import { isVerifiedUser } from "../middlewares/tokenVerification.js";

const router = express.Router();

router.get(
    "/leads/stats/:adminId?",
    isVerifiedUser(["Admin", "User"]),
    getLeadStageCounts
);

router.get(
    "/leads/:adminId?",
    isVerifiedUser(["Admin", "User"]),
    getLeads
);

// Create Lead
router.post(
    "/leads",
    isVerifiedUser(["Admin", "User"]),
    createLead
);

// ✏️ Update Lead Info
router.put(
    "/leads/:leadId",
    isVerifiedUser(["Admin", "User"]),
    updateLeadInfo
);

// Delete Lead
router.delete(
    "/leads/:leadId",
    isVerifiedUser(["Admin", "User"]),
    deleteLead
);



// Add Note
router.post(
    "/leads/:leadId/notes",
    isVerifiedUser(["Admin", "User"]),
    addNote
);

// Get Notes
router.get(
    "/leads/:leadId/notes",
    isVerifiedUser(["Admin", "User"]),
    getNotes
);

// Update Note
router.put(
    "/leads/:leadId/notes/:noteId",
    isVerifiedUser(["Admin", "User"]),
    updateNote
);

// Delete Note
router.delete(
    "/leads/:leadId/notes/:noteId",
    isVerifiedUser(["Admin", "User"]),
    deleteNote
);

// Update Value
router.put(
    "/leads/:leadId/values/:valueId",
    isVerifiedUser(["Admin", "User"]),
    updateValue
);

// Add Value
router.post(
    "/leads/:leadId/values",
    isVerifiedUser(["Admin", "User"]),
    addValue
);

router.post(
    "/leads/bulk-upload",
    isVerifiedUser(["Admin", "User"]),
    bulkUploadLeads
);



export default router;