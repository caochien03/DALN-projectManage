require("dotenv").config();
const { verifyConnection } = require("./src/services/email.service");

console.log("🔧 Testing Email Configuration...\n");

// Check if environment variables are set
console.log("📋 Environment Variables Check:");
console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? "✅ Set" : "❌ Missing"}`);
console.log(
    `EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? "✅ Set" : "❌ Missing"}`
);
console.log(
    `FRONTEND_URL: ${process.env.FRONTEND_URL ? "✅ Set" : "❌ Missing"}\n`
);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log("❌ Missing required environment variables!");
    console.log("Please add the following to your .env file:");
    console.log("EMAIL_USER=your-email@gmail.com");
    console.log("EMAIL_PASSWORD=your-app-password");
    console.log("FRONTEND_URL=http://localhost:3000\n");
    process.exit(1);
}

// Test email connection
console.log("🔐 Testing Email Connection...");
verifyConnection()
    .then(() => {
        console.log("\n✅ Email configuration is working correctly!");
        console.log("You can now use the forgot password feature.");
    })
    .catch((error) => {
        console.log("\n❌ Email configuration failed!");
        console.log("Error:", error.message);

        if (error.message.includes("Invalid login")) {
            console.log("\n💡 SOLUTION: You need to use a Gmail App Password");
            console.log("\n📝 Steps to create an App Password:");
            console.log(
                "1. Go to your Google Account settings: https://myaccount.google.com/"
            );
            console.log("2. Click on 'Security' in the left sidebar");
            console.log(
                "3. Under 'Signing in to Google', click on '2-Step Verification'"
            );
            console.log("4. Scroll down and click on 'App passwords'");
            console.log(
                "5. Select 'Mail' as the app and 'Other' as the device"
            );
            console.log("6. Click 'Generate'");
            console.log("7. Copy the 16-character password (without spaces)");
            console.log("8. Update your .env file with this password");
            console.log(
                "\n⚠️  Important: Never use your regular Gmail password!"
            );
        }
    });
