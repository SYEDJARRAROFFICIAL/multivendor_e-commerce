import Router from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { validate } from "../../core/middleware/validate.js";
import { storeFeedbackValidation } from "../../shared/validators/store.validation.js";
import {
  createFeedback,
  getAllFeedbacks,
  getFeedbacksByStoreId,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} from "./storeFeedback.controller.js";

const storeFeedbackRouter = Router();

storeFeedbackRouter.post(
  "/",
  isLoggedIn(),
  validate(storeFeedbackValidation),
  createFeedback
);
storeFeedbackRouter.get(
  "/",
  isLoggedIn("store-admin", "superAdmin", "analystAdmin", "storeAdmin"),
  getAllFeedbacks
);
// Add new route for getting feedbacks by store ID
storeFeedbackRouter.get(
  "/store/:storeId", // New route: /store-feedback/store/[storeId]
  getFeedbacksByStoreId
);
storeFeedbackRouter.get("/:id", getFeedbackById);
storeFeedbackRouter.put(
  "/:id",
  isLoggedIn(),
  validate(storeFeedbackValidation.partial()),
  updateFeedback
);
storeFeedbackRouter.delete("/:id", isLoggedIn(), deleteFeedback);

export default storeFeedbackRouter;
