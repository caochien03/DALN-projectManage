const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader) {
            throw new Error("Không có header xác thực");
        }

        const token = authHeader.replace("Bearer ", "");

        if (!token) {
            throw new Error("Không có token xác thực");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.log("Auth error:", error.message); // Debug log
        res.status(401).json({
            success: false,
            message: "Please authenticate",
        });
    }
};

module.exports = auth;
