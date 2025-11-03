import { Router } from "express";
import { validate } from "../../core/middleware/validate.js";
import {
  createFactoryFeedback,
  getAllFactoryFeedbacks,
  getFactoryFeedbackById,
  updateFactoryFeedback,
  deleteFactoryFeedback,
} from "./factoryFeedback.controller.js";
import { factoryFeedbackValidation } from "../../shared/validators/factory.validation.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const factoryFeedbackRouter = Router();

// Only store-admins can create feedback
factoryFeedbackRouter.post(
  "/",
  isLoggedIn("store-admin"),
  validate(factoryFeedbackValidation),
  createFactoryFeedback
);

// Public routes (or you can restrict)
factoryFeedbackRouter.get("/", getAllFactoryFeedbacks);
factoryFeedbackRouter.get("/:id", getFactoryFeedbackById);

// Owner-only routes
factoryFeedbackRouter.put(
  "/:id",
  isLoggedIn("store-admin"),
  validate(factoryFeedbackValidation.partial()),
  updateFactoryFeedback
);
factoryFeedbackRouter.delete(
  "/:id",
  isLoggedIn("store-admin"),
  deleteFactoryFeedback
);

export default factoryFeedbackRouter;
