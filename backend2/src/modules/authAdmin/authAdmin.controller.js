import { asyncHandler } from "../../core/utils/async-handler.js";
import Admin from "../../models/Admin.model.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import {
  userForgotPasswordMailBody,
  userVerificationMailBody,
} from "../../shared/constants/mail.constant.js";
import { mailTransporter } from "../../shared/helpers/mail.helper.js";
import {
  storeAccessToken,
  storeLoginCookies,
} from "../../shared/helpers/cookies.helper.js";
import dotenv from "dotenv";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
dotenv.config();

const registerAdmin = asyncHandler(async (req, res) => {
  console.log("=== REGISTER ADMIN DEBUG ===");
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);
  console.log("=========================");
  const {
    adminName,
    adminEmail,
    adminPassword,
    phoneNumber,
    adminAddress,
    adminRole,
  } = req.body;
  const existingAdmin = await Admin.findOne({ adminEmail });

  if (existingAdmin) {
    throw new ApiError(400, "Admin already exists with this email");
  }
  let uploadResult = null;

  // Handle file upload if exists
  if (req.file) {
    try {
      uploadResult = await S3UploadHelper.uploadFile(req.file, "avatars");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw new ApiError(500, "Error uploading avatar to S3");
    }
  }

  const admin = await Admin.create({
    avatar: uploadResult ? uploadResult.key : undefined,
    adminName,
    adminEmail,
    adminPassword,
    phoneNumber,
    adminAddress,
    adminRole,
  });

  if (!admin) {
    throw new ApiError(400, "Admin registration failed");
  }

  const { hashedToken, tokenExpiry } = admin.generateTemporaryToken();
  admin.adminVerificationToken = hashedToken;
  admin.adminVerificationTokenExpiry = tokenExpiry;
  await admin.save();
  const adminVerificationEmailLink = `${process.env.BASE_URL}/api/v1/auth/verify-mail/${hashedToken}`;

  await mailTransporter.sendMail({
    from: process.env.SMTP_SENDER_EMAIL,
    to: adminEmail,
    subject: "Verify your email",
    html: userVerificationMailBody(adminName, adminVerificationEmailLink),
  });
  const response = {
    avatar: admin.avatar,
    adminName: admin.adminName,
    adminEmail: admin.adminEmail,
    phoneNumber: admin.phoneNumber,
    adminAddress: admin.adminAddress,
    adminRole: admin.adminRole,
  };
  if (uploadResult) {
    try {
      response.avatarUrl = await S3UploadHelper.getSignedUrl(uploadResult.key);
    } catch {
      response.avatarUrl = null;
    }
  }
  return res
    .status(201)
    .json(new ApiResponse(201, response, "Admin created successfully"));
});

const verifyAdminMail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) {
    throw new ApiError(400, "Token Not Found");
  }

  const admin = await Admin.findOne({
    adminVerificationToken: token,
    adminVerificationTokenExpiry: { $gt: Date.now() },
  });
  if (!admin) {
    throw new ApiError(400, "Invalid or expired Verification token");
  }
  admin.adminIsVerified = true;
  admin.adminVerificationToken = null;
  admin.adminVerificationTokenExpiry = null;
  await admin.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin email verified successfully"));
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { adminEmail, adminPassword } = req.body;
  const admin = await Admin.findOne({ adminEmail });

  if (!admin) {
    throw new ApiError(400, "Admin not found with this email");
  }
  const isPasswordCorrect = await admin.isPasswordCorrect(adminPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password");
  }
  if (!admin.adminIsVerified) {
    throw new ApiError(400, "Please verify your email to login");
  }

  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();
  storeLoginCookies(res, accessToken, refreshToken);
  admin.adminRefreshToken = refreshToken;
  await admin.save();

  const response = {
    admin: {
      adminName: admin.adminName,
      adminEmail: admin.adminEmail,
      phoneNumber: admin.phoneNumber,
      adminAddress: admin.adminAddress,
      adminRole: admin.adminRole,
      avatar: admin.avatar, // Add avatar field
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
  // Generate signed URL for avatar if exists
  if (admin.avatar) {
    try {
      response.admin.avatarUrl = await S3UploadHelper.getSignedUrl(
        admin.avatar
      );
    } catch (error) {
      console.error("Error generating avatar signed URL:", error);
      response.admin.avatarUrl = null;
    }
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        response,
        `${admin.adminRole} logged in successfully`
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  console.log(`Logout request received:${req.admin}`);
  const adminId = req.admin?._id;
  console.log("Admin ID from req.admin:", adminId); // Debug log
  if (!adminId) {
    throw new ApiError(401, "Unauthorized: Admin not authenticated");
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  admin.adminRefreshToken = null;
  await admin.save();

  res.clearCookie("accessToken", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

const getAccessToken = asyncHandler(async (req, res) => {
  //   const refreshToken = req.cookies.refreshToken;
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized: No refresh token provided");
  }

  const admin = await Admin.findOne({ adminRefreshToken: refreshToken });
  if (!admin) {
    throw new ApiError(403, "Forbidden: Invalid refresh token");
  }

  const accessToken = admin.generateAccessToken();
  storeAccessToken(res, accessToken);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token generated successfully"
      )
    );
});

const forgotPasswordMail = asyncHandler(async (req, res) => {
  const { adminEmail } = req.body;
  const admin = await Admin.findOne({ adminEmail });

  if (!admin) {
    throw new ApiError(404, "Admin not found with this email");
  }

  const { hashedToken, tokenExpiry } = admin.generateTemporaryToken();
  admin.adminPasswordResetToken = hashedToken;
  admin.adminPasswordExpirationDate = tokenExpiry;
  await admin.save();

  const passwordResetEmailLink = `${process.env.BASE_URL}/api/v1/auth/reset-password/${hashedToken}`;

  await mailTransporter.sendMail({
    from: process.env.SMTP_SENDER_EMAIL,
    to: adminEmail,
    subject: "Forgot your password",
    html: userForgotPasswordMailBody(admin.adminName, passwordResetEmailLink),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset email sent successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { adminPassword } = req.body;

  const admin = await Admin.findOne({
    adminPasswordResetToken: token,
    adminPasswordExpirationDate: { $gt: Date.now() },
  });

  if (!admin) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  admin.adminPassword = adminPassword;
  admin.adminPasswordResetToken = null;
  admin.adminPasswordExpirationDate = null;
  await admin.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});
export {
  registerAdmin,
  verifyAdminMail,
  loginAdmin,
  logoutAdmin,
  getAccessToken,
  forgotPasswordMail,
  resetPassword,
};
