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
import { storeProductCategorySchema,updateStoreProductCategorySchema } from "../../shared/validators/store.validation.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";

const router = express.Router();

// CREATE category (only store owner)
router.post("/create", isLoggedIn,authorizeRoles("store-admin"), validate(storeProductCategorySchema), createStoreProductCategory);

// GET all categories (store owner only)
router.get("/getall", isLoggedIn, getAllStoreProductCategories);

// GET single category by ID
router.get("/get/:id", isLoggedIn, getStoreProductCategoryById);

// UPDATE category by ID
router.put("/update/:id", isLoggedIn,validate(updateStoreProductCategorySchema), updateStoreProductCategory);

// DELETE category by ID
router.delete("/delete/:id", isLoggedIn, deleteStoreProductCategory);

export default router;
