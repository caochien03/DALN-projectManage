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
            },
        };
    }

    // Register
    async register(userData) {
        const { name, email, password, position, phone, address } = userData;

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
            role: "member", // Default role
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
            },
        };
    }

    // Get current user
    async getCurrentUser(userId) {
        const user = await User.findById(userId)
            .select("-password")
            .populate("department", "name")
            .populate("tasks", "title");

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    // Update profile
    async updateProfile(userId, updateData) {
        const { name, email, position, phone, address } = updateData;
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        // Check if email is being changed and if it's already taken
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

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send reset email
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
