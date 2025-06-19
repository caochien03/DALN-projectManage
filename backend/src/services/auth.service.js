const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("./email.service");

class AuthService {
    // Login
    async login(email, password) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                position: user.position,
                phone: user.phone,
                address: user.address,
                department: user.department,
                avatar: user.avatar,
                linkedin: user.linkedin,
                twitter: user.twitter,
                github: user.github,
            },
        };
    }

    // Register
    async register(userData) {
        const {
            name,
            email,
            password,
            position,
            phone,
            address,
            avatar,
            linkedin,
            twitter,
            github,
        } = userData;

        let user = await User.findOne({ email });
        if (user) {
            throw new Error("User already exists");
        }

        user = new User({
            name,
            email,
            password,
            position,
            phone,
            address,
            avatar,
            linkedin,
            twitter,
            github,
            role: "member",
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                position: user.position,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
                linkedin: user.linkedin,
                twitter: user.twitter,
                github: user.github,
            },
        };
    }

    // Get current user
    async getCurrentUser(userId) {
        const user = await User.findById(userId)
            .select("-password")
            .populate("department", "name")
            .populate("projects", "name")
            .populate("tasks", "title");

        if (!user) {
            throw new Error("User not found");
        }

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            position: user.position,
            phone: user.phone,
            address: user.address,
            department: user.department,
            avatar: user.avatar,
            linkedin: user.linkedin,
            twitter: user.twitter,
            github: user.github,
        };
    }

    // Update profile
    async updateProfile(userId, updateData) {
        const {
            name,
            email,
            position,
            phone,
            address,
            avatar,
            linkedin,
            twitter,
            github,
        } = updateData;

        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error("Email already in use");
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.position = position || user.position;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.avatar = avatar || user.avatar;
        user.linkedin = linkedin || user.linkedin;
        user.twitter = twitter || user.twitter;
        user.github = github || user.github;

        await user.save();

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            position: user.position,
            phone: user.phone,
            address: user.address,
            department: user.department,
            avatar: user.avatar,
            linkedin: user.linkedin,
            twitter: user.twitter,
            github: user.github,
        };
    }

    // Change password
    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new Error("Current password is incorrect");
        }

        user.password = newPassword;
        await user.save();

        return { message: "Password changed successfully" };
    }

    // Forgot password
    async forgotPassword(email) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found");
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await sendPasswordResetEmail(email, resetToken);

        return { message: "Password reset email sent" };
    }

    // Reset password
    async resetPassword(token, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            throw new Error("Invalid or expired reset token");
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { message: "Password reset successful" };
    }
}

module.exports = new AuthService();
