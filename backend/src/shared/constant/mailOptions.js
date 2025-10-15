import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// // Debug: Log the environment variables when this module is loaded
// console.log("📧 mailOptions.js - Environment check:");
// console.log("SMTP_HOST:", process.env.SMTP_HOST);
// console.log("SMTP_PORT:", process.env.SMTP_PORT);
// console.log("SMTP_USER:", process.env.SMTP_USER);
// console.log("SMTP_PASS:", process.env.SMTP_PASS ? "***SET***" : "NOT SET");

export const mailOptions = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// // Debug: Log the final mailOptions object
// console.log("📧 Final mailOptions:", {
//   host: mailOptions.host,
//   port: mailOptions.port,
//   user: mailOptions.auth.user,
//   pass: mailOptions.auth.pass ? "***SET***" : "NOT SET",
// });

export const emailTemplates = {
  verification: {
    subject: "Verify Your Email - MultiVendor E-Commerce",
  },
};

// export const mailOptions = {
//   host: process.env.SMTP_HOST || "smtp.gmail.com",
//   port: process.env.SMTP_PORT || 587,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// };

// export const emailTemplates = {
//   verification: {
//     subject: "Verify Your Email - MultiVendor E-Commerce",
//   },
// };
