import ExternalIntegration from "../models/ExternalModel.js";

/**
 *CREATE Integration
 */
export const createIntegration = async (req, res) => {
    try {
        const { name, url, apiKey, events, isActive } = req.body;

        const integration = await ExternalIntegration.create({
            name,
            url,
            apiKey,
            events,
            isActive
        });

        res.status(201).json({
            success: true,
            message: "Integration created successfully",
            data: integration
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating integration",
            error: error.message
        });
    }
};


/**
 * ✅ GET ALL Integrations
 */
export const getIntegrations = async (req, res) => {
    try {
        const integrations = await ExternalIntegration.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: integrations.length,
            data: integrations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching integrations",
            error: error.message
        });
    }
};


/**
 * GET SINGLE Integration
 */
export const getIntegrationById = async (req, res) => {
    try {
        const { id } = req.params;

        const integration = await ExternalIntegration.findById(id);

        if (!integration) {
            return res.status(404).json({
                success: false,
                message: "Integration not found"
            });
        }

        res.status(200).json({
            success: true,
            data: integration
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching integration",
            error: error.message
        });
    }
};


/**
 * UPDATE Integration
 */
export const updateIntegration = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, apiKey, events, isActive } = req.body;
        console.log(req.body)
        const integration = await ExternalIntegration.findById(id);

        if (!integration) {
            return res.status(404).json({
                success: false,
                message: "Integration not found"
            });
        }

        if (name) integration.name = name;
        if (url) integration.url = url;
        if (apiKey !== undefined) integration.apiKey = apiKey;
        if (events) integration.events = events;
        if (isActive !== undefined) integration.isActive = isActive;

        await integration.save();

        res.status(200).json({
            success: true,
            message: "Integration updated successfully",
            data: integration
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error updating integration",
            error: error.message
        });
    }
};


/**
 * DELETE Integration
 */
export const deleteIntegration = async (req, res) => {
    try {
        const { id } = req.params;

        const integration = await ExternalIntegration.findById(id);

        if (!integration) {
            return res.status(404).json({
                success: false,
                message: "Integration not found"
            });
        }

        await ExternalIntegration.deleteOne({ _id: id });

        res.status(200).json({
            success: true,
            message: "Integration deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting integration",
            error: error.message
        });
    }
};