import { asyncHandler } from "../../core/utils/async-handler.js";
import User from "../../models/User.model.js";
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
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import dotenv from "dotenv";
dotenv.config();

const registerUser = asyncHandler(async (req, res) => {
  const {
    userName,
    userEmail,
    userPassword,
    phoneNumber,
    userAddress,
    userRole,
  } = req.body;
  const existingUser = await User.findOne({ userEmail });

  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
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

  const user = await User.create({
    avatar: uploadResult ? uploadResult.key : undefined,
    userName,
    userEmail,
    userPassword,
    phoneNumber,
    userAddress,
    userRole,
  });

  if (!user) {
    throw new ApiError(400, "User registration failed");
  }

  const { hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.userVerificationToken = hashedToken;
  user.userVerificationTokenExpiry = tokenExpiry;
  await user.save();
  const userVerificationEmailLink = `${process.env.BASE_URL}/api/v1/auth/verify-mail/${hashedToken}`;

  await mailTransporter.sendMail({
    from: process.env.SMTP_SENDER_EMAIL,
    to: userEmail,
    subject: "Verify your email",
    html: userVerificationMailBody(userName, userVerificationEmailLink),
  });
  const response = {
    avatar: user.avatar,
    userName: user.userName,
    userEmail: user.userEmail,
    phoneNumber: user.phoneNumber,
    userAddress: user.userAddress,
    userRole: user.userRole,
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
    .json(new ApiResponse(201, response, "User created successfully"));
});

const verifyUserMail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) {
    throw new ApiError(400, "Token Not Found");
  }

  const user = await User.findOne({
    userVerificationToken: token,
    userVerificationTokenExpiry: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiError(400, "Invalid or expired Verification token");
  }
  user.userIsVerified = true;
  user.userVerificationToken = null;
  user.userVerificationTokenExpiry = null;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User email verified successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { userEmail, userPassword } = req.body;
  const user = await User.findOne({ userEmail });

  if (!user) {
    throw new ApiError(400, "User not found with this email");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(userPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password");
  }
  if (!user.userIsVerified) {
    throw new ApiError(400, "Please verify your email to login");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  storeLoginCookies(res, accessToken, refreshToken);
  user.userRefreshToken = refreshToken;
  await user.save();

  const response = {
    user: {
      userName: user.userName,
      userEmail: user.userEmail,
      phoneNumber: user.phoneNumber,
      userAddress: user.userAddress,
      userRole: user.userRole,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
  return res
    .status(200)
    .json(new ApiResponse(200, response, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not authenticated");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.userRefreshToken = null;
  await user.save();

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
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getAccessToken = asyncHandler(async (req, res) => {
  //   const refreshToken = req.cookies.refreshToken;
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized: No refresh token provided");
  }

  const user = await User.findOne({ userRefreshToken: refreshToken });
  if (!user) {
    throw new ApiError(403, "Forbidden: Invalid refresh token");
  }

  const accessToken = user.generateAccessToken();
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
  const { userEmail } = req.body;
  const user = await User.findOne({ userEmail });

  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  const { hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.userPasswordResetToken = hashedToken;
  user.userPasswordExpirationDate = tokenExpiry;
  await user.save();

  const passwordResetEmailLink = `${process.env.BASE_URL}/api/v1/auth/reset-password/${hashedToken}`;

  await mailTransporter.sendMail({
    from: process.env.SMTP_SENDER_EMAIL,
    to: userEmail,
    subject: "Forgot your password",
    html: userForgotPasswordMailBody(user.userName, passwordResetEmailLink),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset email sent successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { userPassword } = req.body;

  const user = await User.findOne({
    userPasswordResetToken: token,
    userPasswordExpirationDate: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  user.userPassword = userPassword;
  user.userPasswordResetToken = null;
  user.userPasswordExpirationDate = null;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});
export {
  registerUser,
  verifyUserMail,
  loginUser,
  logoutUser,
  getAccessToken,
  forgotPasswordMail,
  resetPassword,
};
