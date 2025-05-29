const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["open", "close"],
            default: "open",
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                role: {
                    type: String,
                    enum: ["manager", "member"],
                    default: "member",
                },
            },
        ],
        tasks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task",
            },
        ],
        milestones: [
            {
                name: String,
                description: String,
                dueDate: Date,
                status: {
                    type: String,
                    enum: ["pending", "completed"],
                    default: "pending",
                },
            },
        ],
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Project", projectSchema);
