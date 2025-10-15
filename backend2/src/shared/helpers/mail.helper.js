import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "MultiVendor E-commerce",
    link: process.env.CLIENT_URL || "http://localhost:3000",
    copyright: `© ${new Date().getFullYear()} Multivendor E-commerce. All rights reserved.`,
  },
});

export { mailTransporter, mailGenerator };
