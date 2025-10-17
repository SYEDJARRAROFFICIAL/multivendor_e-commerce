import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
const adminSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "https://avatar.iran.liara.run/public/33",
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    adminEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    adminPassword: {
      type: String,
      required: true,
    },
    adminAddress: {
      type: String,
      default: null,
      trim: true,
    },
    adminIsVerified: {
      type: Boolean,
      default: false,
    },
    adminPasswordResetToken: {
      type: String,
      default: null,
    },
    adminPasswordExpirationDate: {
      type: Date,
      default: null,
    },
    adminVerificationToken: {
      type: String,
      default: null,
    },
    adminVerificationTokenExpiry: {
      type: Date,
      default: null,
    },
    adminRefreshToken: {
      type: String,
      default: null,
    },
    adminRole: {
      type: String,
      enum: [
        "superAdmin",
        "analystAdmin",
        "factoryAdmin",
        "storeAdmin",
        "buyerAdmin",
      ],
      default: "superAdmin",
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

adminSchema.pre("save", function (next) {
  if (this.isModified("adminPassword")) {
    this.adminPassword = bcrypt.hashSync(this.adminPassword, 10);
  }
  next();
});

adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.adminPassword);
};

adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      adminEmail: this.adminEmail,
      adminName: this.adminName,
      phoneNumber: this.phoneNumber,
      adminRole: this.adminRole,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

adminSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = Date.now() + 5 * 60 * 1000; // 20 minutes;

  return { unHashedToken, hashedToken, tokenExpiry };
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
