const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res
                .status(401)
                .json({ success: false, message: "Please authenticate" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to perform this action",
            });
        }

        next();
    };
};

module.exports = { checkRole };
