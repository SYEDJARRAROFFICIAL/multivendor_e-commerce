import express from "express";
import { validate } from "../../core/middleware/validate.js";
import { storeCategorySchema } from "../../shared/validators/category.validation.js";
import {
  createCategory,
  getAllCategories,
  getStoreCategories,
  getFactoryCategories,
} from "./category.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const categoryRouter = express.Router();

categoryRouter.post(
  "/createCategory",
  isLoggedIn("superAdmin"),
  validate(storeCategorySchema),
  createCategory
);
categoryRouter.get(
  "/getallcategories",
  isLoggedIn("superAdmin"),
  getAllCategories
);
categoryRouter.get(
  "/storecategory",
  isLoggedIn("superAdmin"),
  getStoreCategories
);
categoryRouter.get(
  "/factorycategory",
  isLoggedIn("superAdmin"),
  getFactoryCategories
);

export default categoryRouter;
