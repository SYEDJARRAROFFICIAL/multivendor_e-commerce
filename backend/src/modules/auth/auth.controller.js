import { asyncHandler } from "../../core/utils/async-handler.js";
import User from "../../models/User.model.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { ApiError } from "../../core/utils/api-error.js";
import emailService from "../../shared/helper/emailService.js";
import crypto from "crypto";

const registerUser = asyncHandler(async (req, res) => {
  const {
    userFullName,
    userName,
    userEmail,
    userPassword,
    userRole,
    phoneNumber,
    userAddress,
  } = req.body;

  // 🔍 Check if user already exists by email
  const existingUserByEmail = await User.findOne({ userEmail });
  if (existingUserByEmail) {
    throw new ApiError(400, "User with this email already exists");
  }

  // 🔍 If username provided, check if it's taken
  if (userName) {
    const existingUserByUsername = await User.findOne({
      userName: userName.toLowerCase(),
    });
    if (existingUserByUsername) {
      throw new ApiError(400, "Username is already taken");
    }
  }

  // ✅ Validate username format if provided
  if (userName) {
    if (!/^[a-z0-9_]+$/.test(userName)) {
      throw new ApiError(
        400,
        "Username can only contain lowercase letters, numbers, and underscores"
      );
    }
    if (userName.length < 3) {
      throw new ApiError(400, "Username must be at least 3 characters long");
    }
  }

  // 🧑‍💻 Create new user (username will be auto-generated if not provided)
  const user = await User.create({
    userFullName,
    userName: userName ? userName.toLowerCase() : undefined,
    userEmail: userEmail.toLowerCase(),
    userPassword,
    userRole: userRole || "buyer",
    phoneNumber,
    userAddress: userAddress || null,
  });

  // ✅ GENERATE VERIFICATION TOKEN AND SEND EMAIL
  const verificationToken = user.generateVerificationToken();
  await user.save(); // Save the token to database

  // Send verification email (non-blocking)
  emailService
    .sendVerificationEmail(user.userEmail, user.userFullName, verificationToken)
    .then((result) => {
      if (result.success) {
        console.log(
          `✅ Verification email sent to ${user.userEmail} from controller`
        );
      } else {
        console.error(
          `❌ Failed to send email to ${user.userEmail}:`,
          result.error
        );
      }
    });

  // 🎯 Remove sensitive fields from response
  const userResponse = {
    _id: user._id,
    userFullName: user.userFullName,
    userName: user.userName,
    userEmail: user.userEmail,
    userRole: user.userRole,
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImage,
    userIsVerified: user.userIsVerified,
    userAddress: user.userAddress,
    createdAt: user.createdAt,
  };

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        userResponse,
        "User registered successfully. Please check your email for verification."
      )
    );
});

// ✅ EMAIL VERIFICATION ENDPOINT
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    userVerificationToken: hashedToken,
    userVerificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  // Verify the user's email
  user.verifyEmail();
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Email verified successfully! You can now login."
      )
    );
});

// ✅ RESEND VERIFICATION EMAIL
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ userEmail: email.toLowerCase() });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.userIsVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  // Generate new verification token
  const verificationToken = user.generateVerificationToken();
  await user.save();

  // Send email
  const emailResult = await emailService.sendVerificationEmail(
    user.userEmail,
    user.userFullName,
    verificationToken
  );

  if (!emailResult.success) {
    throw new ApiError(
      500,
      "Failed to send verification email. Please try again."
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Verification email sent successfully. Please check your inbox."
      )
    );
});

// 🔍 Additional endpoint for username availability check
const checkUsernameAvailability = asyncHandler(async (req, res) => {
  const { userName } = req.params;

  if (!userName) {
    throw new ApiError(400, "Username is required");
  }

  const existingUser = await User.findOne({ userName: userName.toLowerCase() });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        available: !existingUser,
        userName: userName.toLowerCase(),
      },
      existingUser ? "Username is taken" : "Username is available"
    )
  );
});

export {
  registerUser,
  checkUsernameAvailability,
  verifyEmail,
  resendVerificationEmail,
};

// import { asyncHandler } from "../../core/utils/async-handler.js";
// import User from "../../models/User.model.js";
// import { ApiResponse } from "../../core/utils/api-response.js";
// import { ApiError } from "../../core/utils/api-error.js";

// const registerUser = asyncHandler(async (req, res) => {
//   const {
//     userFullName,
//     userName,
//     userEmail,
//     userPassword,
//     userRole,
//     phoneNumber,
//     userAddress,
//   } = req.body;

//   // 🔍 Check if user already exists by email
//   const existingUserByEmail = await User.findOne({ userEmail });
//   if (existingUserByEmail) {
//     throw new ApiError(400, "User with this email already exists");
//   }

//   // 🔍 If username provided, check if it's taken
//   if (userName) {
//     const existingUserByUsername = await User.findOne({
//       userName: userName.toLowerCase(),
//     });
//     if (existingUserByUsername) {
//       throw new ApiError(400, "Username is already taken");
//     }
//   }

//   // ✅ Validate username format if provided
//   if (userName) {
//     if (!/^[a-z0-9_]+$/.test(userName)) {
//       throw new ApiError(
//         400,
//         "Username can only contain lowercase letters, numbers, and underscores"
//       );
//     }
//     if (userName.length < 3) {
//       throw new ApiError(400, "Username must be at least 3 characters long");
//     }
//   }

//   // 🧑‍💻 Create new user (username will be auto-generated if not provided)
//   const user = await User.create({
//     userFullName,
//     userName: userName ? userName.toLowerCase() : undefined, // Let model handle generation if null
//     userEmail: userEmail.toLowerCase(),
//     userPassword,
//     userRole: userRole || "buyer",
//     phoneNumber,
//     userAddress: userAddress || null,
//   });

//   // 🎯 Remove sensitive fields from response
//   const userResponse = {
//     _id: user._id,
//     userFullName: user.userFullName,
//     userName: user.userName,
//     userEmail: user.userEmail,
//     userRole: user.userRole,
//     phoneNumber: user.phoneNumber,
//     profileImage: user.profileImage,
//     userIsVerified: user.userIsVerified,
//     userAddress: user.userAddress,
//     createdAt: user.createdAt,
//   };

//   return res
//     .status(201)
//     .json(new ApiResponse(201, userResponse, "User registered successfully"));
// });

// // 🔍 Additional endpoint for username availability check
// const checkUsernameAvailability = asyncHandler(async (req, res) => {
//   const { userName } = req.params;

//   if (!userName) {
//     throw new ApiError(400, "Username is required");
//   }

//   const existingUser = await User.findOne({ userName: userName.toLowerCase() });

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         available: !existingUser,
//         userName: userName.toLowerCase(),
//       },
//       existingUser ? "Username is taken" : "Username is available"
//     )
//   );
// });

// export { registerUser, checkUsernameAvailability };
