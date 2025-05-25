const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        html: `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send reset email");
    }
};

module.exports = {
    sendPasswordResetEmail,
};
