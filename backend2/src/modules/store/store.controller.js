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

// ---------- CREATE STORE ----------
export const createStore = asyncHandler(async (req, res) => {
  const {
    storeName,
    storeLogo,
    storeCoverImage,
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

  const newStore = await Store.create({
    userID: userId,
    storeName,
    storeLogo,
    storeCoverImage,
    storeDescription,
    storeCategoryId: storeCategoryId || null,
    idCardNumber,
    idCardImage,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newStore, "Store created successfully"));
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

  return res
    .status(200)
    .json(new ApiResponse(200, store, "Store details retrieved successfully"));
});

// ---------- UPDATE STORE ----------
export const updateStore = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updates = req.body;

  const store = await Store.findOne({ userID: userId });
  if (!store) throw new ApiError(404, "Store not found");

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

  return res
    .status(200)
    .json(new ApiResponse(200, store, "Store updated successfully"));
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
