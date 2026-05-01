import StageModel from "../models/StageModel.js";
import LeadModel from "../models/LeadModel.js";

export const getAllStages = async (req, res) => {
  try {
    const stages = await StageModel.find()
      .sort({ order: 1 }) // 👈 primary sort
      .lean(); // 👈 performance boost (optional but recommended)

    res.status(200).json({
      success: true,
      count: stages.length,
      data: stages
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stages",
      error: error.message
    });
  }
};

export const createStage = async (req, res) => {
  try {
    const { name, color } = req.body;

    // 1. Find last stage
    const lastStage = await StageModel.findOne().sort({ order: -1 });

    // 2. Assign next order
    const newOrder = lastStage ? lastStage.order + 1 : 0;

    // 3. Create stage
    const stage = await StageModel.create({
      name,
      color,
      order: newOrder
    });

    res.status(201).json({
      success: true,
      message: "Stage created successfully",
      data: stage
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating stage",
      error: error.message
    });
  }
};

export const updateStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const { name, color } = req.body;

    const stage = await StageModel.findById(stageId);

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Stage not found"
      });
    }

    if (name) stage.name = name;
    if (color) stage.color = color;

    await stage.save();

    res.status(200).json({
      success: true,
      message: "Stage updated successfully",
      data: stage
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating stage",
      error: error.message
    });
  }
};


export const deleteStage = async (req, res) => {
  try {
    const { stageId } = req.params;

    const stage = await StageModel.findById(stageId);

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Stage not found"
      });
    }

    // 1. Check if any leads are using this stage
    const leadsUsingStage = await LeadModel.countDocuments({
      stage: stageId
    });

    if (leadsUsingStage > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete stage with existing leads"
      });
    }

    // 2. Delete stage
    await StageModel.deleteOne({ _id: stageId });

    res.status(200).json({
      success: true,
      message: "Stage deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting stage",
      error: error.message
    });
  }
};

export const updateStageOrder = async (req, res) => {
  console.log("absjkhsfa")
  try {
    const { stages } = req.body;

    // validation
    if (!Array.isArray(stages)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stages data"
      });
    }

    // update all in parallel
    const bulkOps = stages.map((stage) => ({
      updateOne: {
        filter: { _id: stage.id },
        update: { order: stage.order }
      }
    }));

    await StageModel.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Stage order updated successfully"
    });

  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "Error updating stage order",
      error: error.message
    });
  }
};