import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { StoreFeedBack } from "../../models/StoreFeedback.model.js";
import { storeFeedbackValidation } from "../../shared/validators/store.validation.js";
import mongoose from "mongoose";
// CREATE
export const createFeedback = asyncHandler(async (req, res) => {
  const data = storeFeedbackValidation.parse(req.body);

  const feedback = await StoreFeedBack.create({
    ...data,
    userId: req.user._id, // logged-in user
    storeId: req.body.storeId, // ObjectId of the store
  });

  return res
    .status(201)
    .json(new ApiResponse(201, feedback, "Feedback created successfully"));
});

// READ ALL (with populated user & store info)
export const getAllFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await StoreFeedBack.find()
    .populate("userId", "name email")
    .populate("storeId", "name location");
  return res
    .status(200)
    .json(
      new ApiResponse(200, feedbacks, "All feedbacks fetched successfully")
    );
});
// Add this to your storeFeedback.controller.js

// GET FEEDBACKS BY STORE ID
export const getFeedbacksByStoreId = asyncHandler(async (req, res) => {
  const { storeId } = req.params;

  // Validate storeId format (MongoDB ObjectId)
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    throw new ApiError(400, "Invalid store ID");
  }

  const feedbacks = await StoreFeedBack.find({ storeId })
    .populate("userId", "userName userEmail") // Populate user details
    .populate("storeId", "storeName") // Populate store name
    .sort({ createdAt: -1 }); // Latest feedbacks first

  if (!feedbacks || feedbacks.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No feedbacks found for this store"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        feedbacks,
        `Found ${feedbacks.length} feedback(s) for this store`
      )
    );
});
// READ SINGLE
export const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await StoreFeedBack.findById(req.params.id)
    .populate("userId", "name email")
    .populate("storeId", "name location");
  if (!feedback) throw new ApiError(404, "Feedback not found");
  return res
    .status(200)
    .json(new ApiResponse(200, feedback, "Feedback fetched successfully"));
});

// UPDATE (only owner can update)
export const updateFeedback = asyncHandler(async (req, res) => {
  const feedback = await StoreFeedBack.findById(req.params.id);
  if (!feedback) throw new ApiError(404, "Feedback not found");

  // Fix: Change req.user.id to req.user._id
  if (feedback.userId.toString() !== req.user._id.toString())
    throw new ApiError(403, "You can only update your own feedback");

  const data = storeFeedbackValidation.partial().parse(req.body);
  const updatedFeedback = await StoreFeedBack.findByIdAndUpdate(
    req.params.id,
    data,
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedFeedback, "Feedback updated successfully")
    );
});

// DELETE (only owner can delete)
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await StoreFeedBack.findById(req.params.id);
  if (!feedback) throw new ApiError(404, "Feedback not found");

  if (feedback.userId.toString() !== req.user._id)
    throw new ApiError(403, "You can only delete your own feedback");

  await feedback.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Feedback deleted successfully"));
});
