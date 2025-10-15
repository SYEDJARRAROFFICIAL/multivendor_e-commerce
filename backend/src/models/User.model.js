import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateUniqueUsername = async (baseName) => {
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 15);

  let username = sanitized;
  let counter = 1;

  // Check if username exists and append numbers until unique
  while (await mongoose.model("User").exists({ userName: username })) {
    username = `${sanitized}${counter}`;
    counter++;

    if (counter > 100) {
      // Fallback to completely random username
      username = `user${crypto.randomBytes(4).toString("hex")}`;
      break;
    }
  }

  return username;
};

const userSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: "https://avatar.iran.liara.run/public/33",
    },
    userFullName: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[a-z0-9_]+$/.test(v);
        },
        message:
          "Username can only contain lowercase letters, numbers, and underscores",
      },
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [20, "Username cannot exceed 20 characters"],
    },
    userEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    userPassword: {
      type: String,
      required: true,
    },
    userAddress: {
      type: String,
      default: null,
    },
    userIsVerified: {
      type: Boolean,
      default: false,
    },
    userPasswordResetToken: {
      type: String,
      default: null,
    },
    userPasswordExpirationDate: {
      type: Date,
      default: null,
    },
    userVerificationToken: {
      type: String,
      default: null,
    },
    userVerificationTokenExpiry: {
      // ✅ ADD THIS NEW FIELD
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    userRole: {
      type: String,
      enum: ["buyer", "store-admin", "factory-admin", "admin"],
      default: "buyer",
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enhanced pre-save middleware
userSchema.pre("save", async function (next) {
  // Generate username if not provided
  if (!this.userName && this.userFullName) {
    this.userName = await generateUniqueUsername(this.userFullName);
  }

  // Hash password only if modified
  if (this.isModified("userPassword")) {
    this.userPassword = await bcrypt.hash(this.userPassword, 10);
  }

  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.userPassword);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userEmail: this.userEmail,
      userFullName: this.userFullName,
      userName: this.userName,
      userRole: this.userRole,
      phoneNumber: this.phoneNumber,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = Date.now() + 20 * 60 * 1000; // Fixed: 20 minutes

  return { unHashedToken, hashedToken, tokenExpiry };
};

// ✅ ADD THESE METHODS TO YOUR EXISTING USER SCHEMA

// Generate verification token using existing generateTemporaryToken
userSchema.methods.generateVerificationToken = function () {
  const { unHashedToken, hashedToken, tokenExpiry } =
    this.generateTemporaryToken();

  this.userVerificationToken = hashedToken;
  this.userVerificationTokenExpiry = tokenExpiry;

  return unHashedToken;
};

// Verify email method
userSchema.methods.verifyEmail = function () {
  this.userIsVerified = true;
  this.userVerificationToken = undefined;
  this.userVerificationTokenExpiry = undefined;
};

const User = mongoose.model("User", userSchema);

export default User;
