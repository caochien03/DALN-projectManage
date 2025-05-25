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
            res.json(result);
        } catch (error) {
            console.error("Login error:", error);
            res.status(401).json({ message: error.message });
        }
    }

    // Register
    async register(req, res) {
        try {
            const result = await AuthService.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error("Register error:", error);
            res.status(400).json({ message: error.message });
        }
    }

    // Get current user
    async getCurrentUser(req, res) {
        try {
            const user = await AuthService.getCurrentUser(req.user._id);
            res.json(user);
        } catch (error) {
            console.error("Get current user error:", error);
            res.status(404).json({ message: error.message });
        }
    }

    // Update profile
    async updateProfile(req, res) {
        try {
            const result = await AuthService.updateProfile(
                req.user._id,
                req.body
            );
            res.json(result);
        } catch (error) {
            console.error("Update profile error:", error);
            res.status(400).json({ message: error.message });
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
            res.json(result);
        } catch (error) {
            console.error("Change password error:", error);
            res.status(401).json({ message: error.message });
        }
    }

    // Forgot password
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await AuthService.forgotPassword(email);
            res.json(result);
        } catch (error) {
            console.error("Forgot password error:", error);
            res.status(404).json({ message: error.message });
        }
    }

    // Reset password
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            const result = await AuthService.resetPassword(token, newPassword);
            res.json(result);
        } catch (error) {
            console.error("Reset password error:", error);
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new AuthController();
