const mongoose = require("mongoose");
const Project = require("./Project");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["todo", "in_progress", "review", "completed"],
            default: "todo",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        startDate: {
            type: Date,
            required: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                content: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        attachments: [
            {
                name: String,
                url: String,
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        milestone: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Middleware để kiểm tra và cập nhật status của milestone
taskSchema.pre("save", async function (next) {
    if (this.milestone && (this.isNew || this.isModified("status"))) {
        const project = await Project.findById(this.project);
        if (!project) {
            return next(new Error("Project not found"));
        }

        const milestone = project.milestones.id(this.milestone);
        if (milestone && milestone.status === "completed") {
            // Nếu task mới được thêm vào hoặc status thay đổi
            // và milestone đang ở trạng thái completed
            milestone.status = "pending";
            milestone.completedAt = null;
            milestone.completedBy = null;
            await project.save();
        }
    }
    next();
});

module.exports = mongoose.model("Task", taskSchema);
