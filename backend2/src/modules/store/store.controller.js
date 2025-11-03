import Store from "../../models/Store.model.js";
import User from "../../models/User.model.js";
import Category from "../../models/Category.model.js"; // Add this import
import { StoreFeedBack } from "../../models/StoreFeedback.model.js";
import { StoreOrders } from "../../models/StoreOrder.model.js";
import StoreProduct from "../../models/StoreProduct.model.js";
import { StoreTransaction } from "../../models/StoreTransaction.model.js";
import { StoreProductFeedback } from "../../models/StoreProductFeedback.model.js";
import { StoreProductReview } from "../../models/StoreProductReview.model.js";
import { StoreProductCategory } from "../../models/StoreProductCategory.model.js";

import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
// ---------- CREATE STORE ----------
export const createStore = asyncHandler(async (req, res) => {
  console.log("=== CREATE STORE DEBUG ===");
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);
  console.log("=========================");
  const {
    storeName,
    storeDescription,
    storeCategoryId,
    idCardNumber,
    idCardImage,
  } = req.body;

  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const existingStore = await Store.findOne({ userID: userId });
  if (existingStore) throw new ApiError(400, "User already owns a store");

  let logoUploadResult = null;
  let coverImageUploadResult = null;
  // Handle store logo upload
  if (req.files && req.files.storeLogo && req.files.storeLogo[0]) {
    try {
      logoUploadResult = await S3UploadHelper.uploadFile(
        req.files.storeLogo[0],
        "store-logos"
      );
      console.log("Logo uploaded:", logoUploadResult);
    } catch (error) {
      console.error("Error uploading store logo:", error);
      throw new ApiError(500, "Error uploading store logo to S3");
    }
  }
  // Handle store cover image upload
  if (req.files && req.files.storeCoverImage && req.files.storeCoverImage[0]) {
    try {
      coverImageUploadResult = await S3UploadHelper.uploadFile(
        req.files.storeCoverImage[0],
        "store-covers"
      );
      console.log("Cover image uploaded:", coverImageUploadResult);
    } catch (error) {
      console.error("Error uploading store cover image:", error);
      throw new ApiError(500, "Error uploading store cover image to S3");
    }
  }
  const newStore = await Store.create({
    userID: userId,
    storeName,
    storeLogo: logoUploadResult ? logoUploadResult.key : undefined,
    storeCoverImage: coverImageUploadResult
      ? coverImageUploadResult.key
      : undefined,
    storeDescription,
    storeCategoryId: storeCategoryId || null,
    idCardNumber,
    idCardImage,
  });

  // Prepare response with signed URLs
  const response = newStore.toObject();

  // Generate signed URL for logo if uploaded
  if (logoUploadResult) {
    try {
      response.storeLogoUrl = await S3UploadHelper.getSignedUrl(
        logoUploadResult.key
      );
    } catch (error) {
      console.error("Error generating logo signed URL:", error);
      response.storeLogoUrl = null;
    }
  }

  // Generate signed URL for cover image if uploaded
  if (coverImageUploadResult) {
    try {
      response.storeCoverImageUrl = await S3UploadHelper.getSignedUrl(
        coverImageUploadResult.key
      );
    } catch (error) {
      console.error("Error generating cover image signed URL:", error);
      response.storeCoverImageUrl = null;
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, response, "Store created successfully"));
});

// ---------- GET STORE DETAILS ----------
export const getStoreDetails = asyncHandler(async (req, res) => {
  console.log("Fetching store details for user:", req.user);
  const userId = req.user._id;
  console.log("User ID:", userId);
  const store = await Store.findOne({ userID: userId }).populate(
    "storeCategoryId",
    "categoryName categoryType"
  );

  if (!store) throw new ApiError(404, "User does not have a store");

  const storeObj = store.toObject();
  // Generate signed URLs for existing images
  if (storeObj.storeLogo) {
    try {
      storeObj.storeLogoUrl = await S3UploadHelper.getSignedUrl(
        storeObj.storeLogo
      );
    } catch (error) {
      storeObj.storeLogoUrl = null;
    }
  }

  if (storeObj.storeCoverImage) {
    try {
      storeObj.storeCoverImageUrl = await S3UploadHelper.getSignedUrl(
        storeObj.storeCoverImage
      );
    } catch (error) {
      storeObj.storeCoverImageUrl = null;
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, storeObj, "Store details retrieved successfully")
    );
});

// ---------- UPDATE STORE ----------
export const updateStore = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updates = req.body;
  console.log("=== UPDATE STORE DEBUG ===");
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);
  console.log("=========================");

  const store = await Store.findOne({ userID: userId });
  if (!store) throw new ApiError(404, "Store not found");

  let logoUploadResult = null;
  let coverImageUploadResult = null;

  // Handle new store logo upload
  if (req.files && req.files.storeLogo && req.files.storeLogo[0]) {
    // Delete old logo if exists
    if (store.storeLogo) {
      try {
        await S3UploadHelper.deleteFile(store.storeLogo);
        console.log("Old logo deleted");
      } catch (error) {
        console.error("Error deleting old store logo:", error);
      }
    }

    try {
      logoUploadResult = await S3UploadHelper.uploadFile(
        req.files.storeLogo[0],
        "store-logos"
      );
      updates.storeLogo = logoUploadResult.key;
      console.log("New logo uploaded:", logoUploadResult);
    } catch (error) {
      console.error("Error uploading new store logo:", error);
      throw new ApiError(500, "Error uploading new store logo to S3");
    }
  }

  // Handle new store cover image upload
  if (req.files && req.files.storeCoverImage && req.files.storeCoverImage[0]) {
    // Delete old cover image if exists
    if (store.storeCoverImage) {
      try {
        await S3UploadHelper.deleteFile(store.storeCoverImage);
        console.log("Old cover image deleted");
      } catch (error) {
        console.error("Error deleting old store cover image:", error);
      }
    }

    try {
      coverImageUploadResult = await S3UploadHelper.uploadFile(
        req.files.storeCoverImage[0],
        "store-covers"
      );
      updates.storeCoverImage = coverImageUploadResult.key;
      console.log("New cover image uploaded:", coverImageUploadResult);
    } catch (error) {
      console.error("Error uploading new store cover image:", error);
      throw new ApiError(500, "Error uploading new store cover image to S3");
    }
  }

  const allowedFields = [
    "storeName",
    "storeLogo",
    "storeCoverImage",
    "storeDescription",
    "storeCategoryId",
  ];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) store[field] = updates[field];
  });

  await store.save();
  const response = store.toObject();

  // Generate signed URLs for response
  if (response.storeLogo) {
    try {
      response.storeLogoUrl = await S3UploadHelper.getSignedUrl(
        response.storeLogo
      );
    } catch {
      response.storeLogoUrl = null;
    }
  }

  if (response.storeCoverImage) {
    try {
      response.storeCoverImageUrl = await S3UploadHelper.getSignedUrl(
        response.storeCoverImage
      );
    } catch {
      response.storeCoverImageUrl = null;
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Store updated successfully"));
});

// ---------- DELETE STORE ----------
export const deleteStore = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const store = await Store.findOne({ userID: userId });
  if (!store) throw new ApiError(404, "Store not found");

  const storeId = store._id;

  await Promise.all([
    StoreFeedBack.deleteMany({ storeId }),
    StoreOrders.deleteMany({ storeId }),
    StoreProduct.deleteMany({ storeId }),
    StoreTransaction.deleteMany({ storeId }),
    StoreProductFeedback.deleteMany({ storeId }),
    StoreProductReview.deleteMany({ storeId }),
    StoreProductCategory.deleteMany({ storeId }),
    // StoreCategory.deleteMany({ storeId }),
  ]);

  await Store.deleteOne({ _id: storeId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Store and all associated data deleted successfully"
      )
    );
});

// ---------- GET ALL STORES ----------
export const getAllStores = asyncHandler(async (req, res) => {
  const stores = await Store.find()
    .populate("storeCategoryId", "categoryName categoryType")
    .populate("userID", "fullName email");

  if (!stores || stores.length === 0)
    throw new ApiError(404, "No stores found");

  return res
    .status(200)
    .json(new ApiResponse(200, stores, "All stores retrieved successfully"));
});
