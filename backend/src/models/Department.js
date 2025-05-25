const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for department's URL
departmentSchema.virtual("url").get(function () {
    return `/departments/${this._id}`;
});

// Virtual for getting department members count
departmentSchema.virtual("memberCount", {
    ref: "User",
    localField: "_id",
    foreignField: "department",
    count: true,
});

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
