import Router from "express";
import { validate } from "../../core/middleware/validate.js";
import { storeProductReviewValidation } from "../../shared/validators/store.validation.js";
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "./storeProductReview.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const storeProductReviewRouter = Router();

storeProductReviewRouter.post("/",isLoggedIn, validate(storeProductReviewValidation), createReview);
storeProductReviewRouter.get("/", getAllReviews);
storeProductReviewRouter.get("/:id", getReviewById);
storeProductReviewRouter.put("/:id",isLoggedIn, validate(storeProductReviewValidation.partial()), updateReview);
storeProductReviewRouter.delete("/:id", deleteReview);

export default storeProductReviewRouter;
