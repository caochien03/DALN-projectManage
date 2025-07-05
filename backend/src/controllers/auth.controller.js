const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../services/email.service");
const AuthService = require("../services/auth.service");

class AuthController {
    // Login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            res.json({
                success: true,
                message: "Đăng nhập thành công!",
                data: result,
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(401).json({ success: false, message: error.message });
        }
    }

    // Register
    async register(req, res) {
        try {
            const result = await AuthService.register(req.body);
            res.status(201).json({
                success: true,
                message: "Đăng ký thành công!",
                data: result,
            });
        } catch (error) {
            console.error("Register error:", error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Get current user
    async getCurrentUser(req, res) {
        try {
            const user = await AuthService.getCurrentUser(req.user._id);
            res.json({ success: true, data: user });
        } catch (error) {
            console.error("Get current user error:", error);
            res.status(404).json({ success: false, message: error.message });
        }
    }

    // Update profile
    async updateProfile(req, res) {
        try {
            const result = await AuthService.updateProfile(
                req.user._id,
                req.body
            );
            res.json({
                success: true,
                message: "Cập nhật thông tin thành công!",
                data: result,
            });
        } catch (error) {
            console.error("Update profile error:", error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const result = await AuthService.changePassword(
                req.user._id,
                currentPassword,
                newPassword
            );
            res.json({
                success: true,
                message: "Đổi mật khẩu thành công!",
                data: result,
            });
        } catch (error) {
            console.error("Change password error:", error);
            res.status(401).json({ success: false, message: error.message });
        }
    }

    // Forgot password
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await AuthService.forgotPassword(email);
            res.json({
                success: true,
                message: "Đã gửi hướng dẫn đặt lại mật khẩu!",
                data: result,
            });
        } catch (error) {
            console.error("Forgot password error:", error);
            res.status(404).json({ success: false, message: error.message });
        }
    }

    // Reset password
    async resetPassword(req, res) {
        try {
            console.log("RESET PASSWORD BODY:", req.body);
            const { token, password } = req.body;
            const result = await AuthService.resetPassword(token, password);
            res.json({
                success: true,
                message: "Đặt lại mật khẩu thành công!",
                data: result,
            });
        } catch (error) {
            console.error("Reset password error:", error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Upload avatar
    async uploadAvatar(req, res) {
        try {
            const user = await User.findById(req.user._id);
            if (!user)
                return res.status(404).json({ message: "User not found" });
            if (req.file) {
                user.avatar = `/uploads/avatars/${req.file.filename}`;
                await user.save();
                return res.json({ success: true, avatar: user.avatar });
            }
            res.status(400).json({ message: "No file uploaded" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = new AuthController();
