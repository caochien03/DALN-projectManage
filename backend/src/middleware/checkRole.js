const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Please authenticate" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "You don't have permission to perform this action",
            });
        }

        next();
    };
};

module.exports = { checkRole };
