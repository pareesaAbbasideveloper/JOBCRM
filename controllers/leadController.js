import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import LeadModel from "../models/LeadModel.js";
import StageModel from "../models/StageModel.js";
import { triggerWebhook } from "../services/webhookTrigger.js";
import dotenv from "dotenv";
dotenv.config();
export const getLeadStageCounts = async (req, res) => {
    try {
        const { adminId } = req.params;

        const stages = await StageModel.find().sort({ order: 1 });

        const matchCondition = {};
        if (adminId) {
            matchCondition.adminId = new mongoose.Types.ObjectId(adminId);
        }

        const data = await LeadModel.aggregate([
            { $match: matchCondition },

            // take last value from values array
            {
                $addFields: {
                    lastValue: { $arrayElemAt: ["$values", -1] }
                }
            },

            {
                $group: {
                    _id: "$stage",
                    count: { $sum: 1 },

                    // 💰 sum latest "to"
                    totalValue: { $sum: "$lastValue.to" }
                }
            }
        ]);

        const map = {};
        data.forEach(item => {
            map[item._id?.toString()] = {
                count: item.count,
                value: item.totalValue || 0
            };
        });

        const result = stages.map(stage => ({
            stageId: stage._id,
            stageName: stage.name,
            color: stage.color,

            count: map[stage._id.toString()]?.count || 0,
            value: map[stage._id.toString()]?.value || 0
        }));

        return res.status(200).json({
            success: true,
            mode: adminId ? "admin" : "global",
            data: result
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error fetching stage counts",
            error: error.message
        });
    }
};

export const getLeads = async (req, res) => {
    try {
        const { adminId } = req.params; // optional

        // build match condition dynamically
        const matchCondition = {};

        if (adminId) {
            matchCondition.adminId = new mongoose.Types.ObjectId(adminId);
        }

        const leads = await LeadModel.find(matchCondition)
            .populate("stage") // optional if you want stage details
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            mode: adminId ? "admin" : "global",
            count: leads.length,
            data: leads
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching leads",
            error: error.message
        });
    }
};



export const updateLeadInfo = async (req, res) => {
    try {
        const { leadId } = req.params;

        const {
            name,
            email,
            phone,
            instagram,
            facebook,
            stage,
            adminId
        } = req.body;

        // 1. Find lead
        const lead = await LeadModel.findById(leadId);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        const timelineUpdates = [];

        let stageChanged = false;
        let isClosed = false;

        // 2. Field updates

        if (name && name !== lead.name) {
            timelineUpdates.push({
                action: "Name Updated",
                meta: { from: lead.name, to: name }
            });
            lead.name = name;
        }

        if (email && email !== lead.email) {
            timelineUpdates.push({
                action: "Email Updated",
                meta: { from: lead.email, to: email }
            });
            lead.email = email;
        }

        if (phone && phone !== lead.phone) {
            timelineUpdates.push({
                action: "Phone Updated",
                meta: { from: lead.phone, to: phone }
            });
            lead.phone = phone;
        }

        if (adminId && adminId !== String(lead.adminId)) {

            const oldAdmin = lead.adminId;

            lead.adminId = adminId;

            timelineUpdates.push({
                action: "Lead Assigned",
                meta: {
                    from: oldAdmin || null,
                    to: adminId
                }
            });
        }   
        // 3. Social update
        if (instagram !== undefined || facebook !== undefined) {
            const oldSocial = {
                instagram: lead.social?.instagram || "",
                facebook: lead.social?.facebook || ""
            };

            const newSocial = {
                instagram: instagram ?? oldSocial.instagram,
                facebook: facebook ?? oldSocial.facebook
            };

            if (
                newSocial.instagram !== oldSocial.instagram ||
                newSocial.facebook !== oldSocial.facebook
            ) {
                lead.social.instagram = newSocial.instagram;
                lead.social.facebook = newSocial.facebook;

                timelineUpdates.push({
                    action: "Social Updated",
                    meta: {
                        from: oldSocial,
                        to: newSocial
                    }
                });
            }
        }

        // 4. Stage update
        if (stage && stage !== String(lead.stage)) {

            const oldStage = await StageModel.findById(lead.stage);
            const newStage = await StageModel.findById(stage);

            if (!newStage) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid stage"
                });
            }

            lead.stage = stage;

            stageChanged = true;

            if (newStage.name === "Won" || newStage.name === "Lost") {
                isClosed = true;
            }

            timelineUpdates.push({
                action: "Stage Changed",
                meta: {
                    from: oldStage?.name,
                    to: newStage.name
                }
            });
        }

        // 5. Save timeline
        if (timelineUpdates.length > 0) {
            lead.timeline.push(...timelineUpdates);
        }

        // 6. Save lead
        await lead.save();

        // 7. WEBHOOKS (EVENT SYSTEM)

        // general update
        if (timelineUpdates.length > 0) {
            triggerWebhook("lead_updated", {
                leadId: lead._id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                stage: lead.stage,
                changes: timelineUpdates
            });
        }

        // stage update
        if (stageChanged) {
            triggerWebhook("lead_stage_update", {
                leadId: lead._id,
                stage: lead.stage,
                changes: timelineUpdates.filter(t => t.action === "Stage Changed")
            });
        }

        // closed (won/lost)
        if (isClosed) {
            triggerWebhook("lead_closed", {
                leadId: lead._id,
                finalStage: lead.stage,
                status: lead.stage,
                summary: timelineUpdates
            });
        }

        // response
        return res.status(200).json({
            success: true,
            message: "Lead updated successfully",
            data: lead
        });

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            success: false,
            message: "Error updating lead",
            error: error.message
        });
    }
};


export const deleteLead = async (req, res) => {
    try {
        const { leadId } = req.params;

        // 1. Find lead that belongs to this admin
        const lead = await LeadModel.findOne({
            _id: leadId,
        });

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found or unauthorized"
            });
        }

        // 2. Delete lead
        await LeadModel.deleteOne({ _id: leadId });

        res.status(200).json({
            success: true,
            message: "Lead deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting lead",
            error: error.message
        });
    }
};


export const createLead = async (req, res) => {
    try {
        let stageId = req.body.stage;
        let adminId = req.body.assigned;
        const {
            name,
            email,
            phone,
            instagram,
            facebook,
        } = req.body;

        console.log("stagge", stageId)

        // 1. Validate required field
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        // 2. Validate stage if provided
        let stage = null;

        if (stageId) {
            stage = await StageModel.findById(stageId);

            if (!stage) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid stage"
                });
            }
        }

        // 3. Create lead
        const lead = await LeadModel.create({
            adminId,
            name,
            email,
            phone,
            social: {
                instagram,
                facebook
            },
            stage: stageId || null,

            timeline: [
                {
                    action: "Lead Created",
                    meta: {
                        stage: stage?.name || null
                    }
                }
            ]
        });

        triggerWebhook("lead_created", lead);

        res.status(201).json({
            success: true,
            message: "Lead created successfully",
            data: lead
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error creating lead",
            error: error.message
        });
    }
};


export const addNote = async (req, res) => {
    try {
        const { leadId } = req.params;
        const { text } = req.body;

        const lead = await LeadModel.findById(leadId);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        lead.notes.push({ text });

        await lead.save();

        res.status(201).json({
            success: true,
            message: "Note added",
            data: lead.notes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding note",
            error: error.message
        });
    }
};



export const getNotes = async (req, res) => {
    try {
        const { leadId } = req.params;

        const lead = await LeadModel.findById(leadId).select("notes");

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        res.status(200).json({
            success: true,
            data: lead.notes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching notes",
            error: error.message
        });
    }
};


export const updateNote = async (req, res) => {
    try {
        const { leadId, noteId } = req.params;
        const { text } = req.body;

        const lead = await LeadModel.findById(leadId);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        const note = lead.notes.id(noteId);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        const oldText = note.text;
        note.text = text;

        lead.timeline.push({
            action: "Note Updated",
            meta: { from: oldText, to: text }
        });

        await lead.save();

        res.status(200).json({
            success: true,
            message: "Note updated",
            data: note
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating note",
            error: error.message
        });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const { leadId, noteId } = req.params;

        const lead = await LeadModel.findById(leadId);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        const note = lead.notes.id(noteId);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        // ✅ correct way
        lead.notes.pull(noteId);

        lead.timeline.push({
            action: "Note Deleted",
            meta: { noteId }
        });

        await lead.save();

        res.status(200).json({
            success: true,
            message: "Note deleted"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error deleting note",
            error: error.message
        });
    }
};

export const updateValue = async (req, res) => {
    try {
        const { leadId, valueId } = req.params;
        const { from, to } = req.body;

        const lead = await LeadModel.findById(leadId);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        // Find specific value
        const value = lead.values.id(valueId);

        if (!value) {
            return res.status(404).json({
                success: false,
                message: "Value not found"
            });
        }

        const oldValue = {
            from: value.from,
            to: value.to
        };

        // Update fields
        if (from !== undefined) value.from = from;
        if (to !== undefined) value.to = to;

        // Timeline log
        lead.timeline.push({
            action: "Value Updated",
            meta: {
                from: oldValue,
                to: {
                    from: value.from,
                    to: value.to
                }
            }
        });

        await lead.save();

        res.status(200).json({
            success: true,
            message: "Value updated successfully",
            data: value
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating value",
            error: error.message
        });
    }
};


export const addValue = async (req, res) => {
    try {
        const { leadId } = req.params;
        const { from, to } = req.body;

        const lead = await LeadModel.findById(leadId);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        // create new value entry
        const newValue = {
            from,
            to
        };

        lead.values.push(newValue);

        // timeline log
        lead.timeline.push({
            action: "Value Added",
            meta: {
                from,
                to
            }
        });

        await lead.save();

        // return last inserted value (with id)
        const savedValue = lead.values[lead.values.length - 1];

        res.status(201).json({
            success: true,
            message: "Value added successfully",
            data: savedValue
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error adding value",
            error: error.message
        });
    }
};


export const bulkUploadLeads = async (req, res) => {
    try {
        const adminId = req.body.adminId; // or req.user._id
        const filePath = req.file.path;

        const results = [];
        const errors = [];

        // optional: preload stages for fast lookup
        const stages = await StageModel.find();
        const stageMap = new Map(stages.map(s => [s.name.toLowerCase(), s._id]));

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", async () => {
                const leadsToInsert = [];

                for (let row of results) {
                    try {
                        if (!row.name) continue;

                        const stageId =
                            stageMap.get((row.stage || "").toLowerCase()) || null;

                        leadsToInsert.push({
                            adminId,
                            name: row.name,
                            email: row.email || "",
                            phone: row.phone || "",
                            social: {
                                instagram: row.instagram || "",
                                facebook: row.facebook || ""
                            },
                            stage: stageId,
                            timeline: [
                                {
                                    action: "Lead Imported via CSV",
                                    meta: { source: "csv" }
                                }
                            ]
                        });

                    } catch (err) {
                        errors.push({ row, error: err.message });
                    }
                }

                await LeadModel.insertMany(leadsToInsert);

                fs.unlinkSync(filePath); // cleanup

                res.status(201).json({
                    success: true,
                    inserted: leadsToInsert.length,
                    failed: errors.length,
                    errors
                });
            });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "CSV upload failed",
            error: error.message
        });
    }
};