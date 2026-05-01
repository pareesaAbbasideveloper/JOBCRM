import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const valueSchema = new mongoose.Schema({
    from: Number,
    to: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const timelineSchema = new mongoose.Schema({
    action: String,
    meta: Object,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const leadSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account", 
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true
    },
    email: String,
    phone: String,

    social: {
        instagram: String,
        facebook: String
    },

    stage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stage"
    },

    notes: [noteSchema],
    values: [valueSchema],
    timeline: [timelineSchema]

}, { timestamps: true });

export default mongoose.model("Lead", leadSchema);