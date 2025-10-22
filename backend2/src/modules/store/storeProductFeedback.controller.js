import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { StoreProductFeedback } from "../../models/StoreProductFeedback.model.js";
import { storeProductFeedbackValidation } from "../../shared/validators/store.validation.js";
import StoreProduct  from "../../models/StoreProduct.model.js";

// CREATE
export const createProductFeedback = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  // Validate only user input
  const data = storeProductFeedbackValidation.parse(req.body);

  // Assign logged-in user
  data.userId = req.user._id;

  // Fetch product from DB to get storeId
  const product = await StoreProduct.findById(data.storeProductId);
  if (!product) throw new ApiError(404, "Product not found");

  // Assign storeId from product
  data.storeId = product.storeId;

  // Now create feedback
  const feedback = await StoreProductFeedback.create(data);

  return res
    .status(201)
    .json(new ApiResponse(201, feedback, "Product feedback created successfully"));
});
// READ ALL
export const getAllProductFeedback = asyncHandler(async (req, res) => {
  const feedbacks = await StoreProductFeedback.find();
  return res.status(200).json(new ApiResponse(200, feedbacks, "All product feedbacks fetched successfully"));
});

// READ SINGLE
export const getProductFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await StoreProductFeedback.findById(req.params.id);
  if (!feedback) throw new ApiError(404, "Product feedback not found");
  return res.status(200).json(new ApiResponse(200, feedback, "Product feedback fetched successfully"));
});

// UPDATE
export const updateProductFeedback = asyncHandler(async (req, res) => {
  const data = storeProductFeedbackValidation.partial().parse(req.body);
  const updatedFeedback = await StoreProductFeedback.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!updatedFeedback) throw new ApiError(404, "Product feedback not found");
  return res.status(200).json(new ApiResponse(200, updatedFeedback, "Product feedback updated successfully"));
});

// DELETE
export const deleteProductFeedback = asyncHandler(async (req, res) => {
  const deletedFeedback = await StoreProductFeedback.findByIdAndDelete(req.params.id);
  if (!deletedFeedback) throw new ApiError(404, "Product feedback not found");
  return res.status(200).json(new ApiResponse(200, {}, "Product feedback deleted successfully"));
});
