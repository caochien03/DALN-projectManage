const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "../../uploads/avatars");
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + file.originalname;
        cb(null, uniqueSuffix);
    },
});

const uploadAvatar = multer({ storage });
module.exports = uploadAvatar;
