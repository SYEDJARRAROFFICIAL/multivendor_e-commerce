import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import User from "../../models/User.model.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";

const updateUserAvatar = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!req.file) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete old avatar from S3 if exists
  if (user.avatar) {
    try {
      await S3UploadHelper.deleteFile(user.avatar);
    } catch (error) {
      console.error("Error deleting old avatar:", error);
    }
  }

  // Upload new avatar
  const uploadResult = await S3UploadHelper.uploadFile(req.file, "avatars");

  // Update user with new avatar key
  user.avatar = uploadResult.key;
  await user.save();

  // Generate signed URL for the new avatar
  const avatarUrl = await S3UploadHelper.getSignedUrl(uploadResult.key);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { avatar: uploadResult.key, avatarUrl },
        "Avatar updated successfully"
      )
    );
});

const deleteUserAvatar = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.avatar) {
    throw new ApiError(400, "User does not have an avatar");
  }

  // Delete avatar from S3
  await S3UploadHelper.deleteFile(user.avatar);

  // Remove avatar reference from user
  user.avatar = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Avatar deleted successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-userPassword");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userObj = user.toObject();

  // Generate signed URL for avatar if exists
  if (userObj.avatar) {
    try {
      userObj.avatarUrl = await S3UploadHelper.getSignedUrl(userObj.avatar);
    } catch (error) {
      userObj.avatarUrl = null;
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userObj, "User profile retrieved successfully"));
});

export { updateUserAvatar, deleteUserAvatar, getUserProfile };
