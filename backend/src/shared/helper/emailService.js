import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { mailOptions, emailTemplates } from "../constant/mailOptions.js";
import dotenv from "dotenv";

// Load environment variables FIRST, before any other imports
dotenv.config();
class EmailService {
  constructor() {
    // // Debug: Log all SMTP environment variables
    // console.log("🔍 Environment Variables Debug:");
    // console.log("SMTP_HOST:", process.env.SMTP_HOST);
    // console.log("SMTP_PORT:", process.env.SMTP_PORT);
    // console.log("SMTP_USER:", process.env.SMTP_USER);
    // console.log("SMTP_PASS:", process.env.SMTP_PASS ? "***SET***" : "NOT SET");

    this.transporter = nodemailer.createTransport(mailOptions);
    this.mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "MultiVendor E-Commerce",
        link: process.env.FRONTEND_URL || "http://localhost:3000",
        logo: "https://avatar.iran.liara.run/public/33",
        copyright: `Copyright © ${new Date().getFullYear()} MultiVendor E-Commerce. All rights reserved.`,
      },
    });
  }

  // Generate verification email content
  generateVerificationEmail(userName, verificationUrl) {
    const emailTemplate = {
      body: {
        name: userName,
        intro:
          "Welcome to MultiVendor E-Commerce! We're very excited to have you on board.",
        action: {
          instructions:
            "To verify your email address and start using your account, please click the button below:",
          button: {
            color: "#22BC66",
            text: "Verify Your Email",
            link: verificationUrl,
          },
        },
        outro:
          "If you did not create an account, no further action is required on your part.",
        signature: "Best regards",
      },
    };

    return {
      html: this.mailGenerator.generate(emailTemplate),
      text: this.mailGenerator.generatePlaintext(emailTemplate),
    };
  }

  // Send verification email
  async sendVerificationEmail(userEmail, userName, verificationToken) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/api/v1/auth/verify-email?token=${verificationToken}`;
      console.log("🔗 Verification URL:", verificationUrl); // Log the verification URL
      const emailContent = this.generateVerificationEmail(
        userName,
        verificationUrl
      );

      const mailOptions = {
        from: `"MultiVendor E-Commerce" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: emailTemplates.verification.subject,
        html: emailContent.html,
        text: emailContent.text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(
        `✅ Verification email sent to: ${userEmail} from email service`
      );
      return { success: true };
    } catch (error) {
      console.error("❌ Error sending verification email:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();
