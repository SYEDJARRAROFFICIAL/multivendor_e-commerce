import express from "express";
import { validate } from "../../core/middleware/validate.js";
import {
  createFactoryProductReviewSchema,
  updateFactoryProductReviewSchema,
} from "../../shared/validators/factory.validation.js";
import {
  createFactoryProductReview,
  getAllFactoryProductReviews,
  getFactoryProductReviewById,
  updateFactoryProductReview,
  deleteFactoryProductReview,
} from "./factoryProductReview.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const router = express.Router();

router.post(
  "/create",
  isLoggedIn("store-admin"),
  validate(createFactoryProductReviewSchema),
  createFactoryProductReview
);

router.get(
  "/all",
  isLoggedIn("superAdmin", "factory-admin"),
  getAllFactoryProductReviews
);

router.get(
  "/:id",
  isLoggedIn("superAdmin", "factory-admin", "store-admin"),
  getFactoryProductReviewById
);

router.put(
  "/update/:id",
  isLoggedIn("store-admin"),
  validate(updateFactoryProductReviewSchema),
  updateFactoryProductReview
);

router.delete(
  "/delete/:id",
  isLoggedIn("store-admin"),
  deleteFactoryProductReview
);

export default router;
