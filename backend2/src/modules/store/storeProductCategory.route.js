import express from "express";
import {
  createStoreProductCategory,
  getAllStoreProductCategories,
  getStoreProductCategoryById,
  updateStoreProductCategory,
  deleteStoreProductCategory,
} from "./storeProductCategory.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { validate } from "../../core/middleware/validate.js";
import {
  storeProductCategorySchema,
  updateStoreProductCategorySchema,
} from "../../shared/validators/store.validation.js";

const router = express.Router();

// CREATE category (only store owner)
router.post(
  "/create",
  isLoggedIn("store-admin"),
  validate(storeProductCategorySchema),
  createStoreProductCategory
);

// GET all categories (store owner only)
router.get("/getall", isLoggedIn("store-admin"), getAllStoreProductCategories);

// GET single category by ID
router.get("/get/:id", isLoggedIn("store-admin"), getStoreProductCategoryById);

// UPDATE category by ID
router.put(
  "/update/:id",
  isLoggedIn("store-admin"),
  validate(updateStoreProductCategorySchema),
  updateStoreProductCategory
);

// DELETE category by ID
router.delete(
  "/delete/:id",
  isLoggedIn("store-admin"),
  deleteStoreProductCategory
);

export default router;
