const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // This should be an App Password, not your regular password
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Verify connection configuration
const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log("✅ Email server connection verified successfully");
    } catch (error) {
        console.error("❌ Email server connection failed:", error.message);
        if (error.message.includes("Invalid login")) {
            console.error(
                "💡 Solution: Use an App Password instead of your regular Gmail password"
            );
            console.error("💡 Steps:");
            console.error(
                "   1. Enable 2-Factor Authentication on your Gmail account"
            );
            console.error(
                "   2. Go to Google Account Settings > Security > App passwords"
            );
            console.error("   3. Generate an app password for 'Mail'");
            console.error(
                "   4. Use that 16-character password in your .env file"
            );
        }
    }
};

// Verify connection on startup
verifyConnection();

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
        console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
        console.error("❌ Error sending email:", error.message);

        // Provide specific error messages for common issues
        if (error.message.includes("Invalid login")) {
            throw new Error(
                "Email authentication failed. Please check your email credentials in .env file"
            );
        } else if (error.message.includes("Invalid recipient")) {
            throw new Error("Invalid email address");
        } else {
            throw new Error(
                "Failed to send reset email. Please try again later."
            );
        }
    }
};

module.exports = {
    sendPasswordResetEmail,
    verifyConnection,
};
