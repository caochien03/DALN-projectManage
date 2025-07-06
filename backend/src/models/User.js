const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["admin", "manager", "member"],
            default: "member",
        },
        avatar: {
            type: String,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        position: {
            type: String,
            trim: true,
        },
        tasks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task",
            },
        ],
        notifications: [
            {
                type: {
                    type: String,
                    enum: [
                        "task_assigned",
                        "task_due",
                        "project_update",
                        "comment",
                    ],
                    required: true,
                },
                message: String,
                read: {
                    type: Boolean,
                    default: false,
                },
                relatedTo: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: "notifications.onModel",
                },
                onModel: {
                    type: String,
                    enum: ["Project", "Task"],
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        phone: {
            type: String,
            default: "",
        },
        address: {
            type: String,
            default: "",
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
