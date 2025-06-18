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
        departments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Department",
            },
        ],
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
        pendingMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
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
                completedAt: Date,
                completedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            },
        ],
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        completedAt: Date,
        completedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Middleware để kiểm tra tính nhất quán của milestone
projectSchema.pre("save", async function (next) {
    if (this.isModified("milestones")) {
        const hasPendingMilestone = this.milestones.some(
            (m) => m.status === "pending" && m.completedAt
        );

        if (hasPendingMilestone) {
            // Nếu có milestone chuyển từ completed sang pending
            // Cập nhật status của project nếu cần
            if (this.status === "close") {
                this.status = "open";
                this.completedAt = null;
                this.completedBy = null;
            }
        }
    }
    next();
});

projectSchema.methods.updateProgress = async function () {
    const Task = require("./Task");
    const tasks = await Task.find({ project: this._id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    this.progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    await this.save();
};

module.exports = mongoose.model("Project", projectSchema);
