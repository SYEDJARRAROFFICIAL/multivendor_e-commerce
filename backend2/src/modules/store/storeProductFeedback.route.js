import Router from "express";
import { validate } from "../../core/middleware/validate.js";
import { storeProductFeedbackValidation } from "../../shared/validators/store.validation.js";
import {
  createProductFeedback,
  getAllProductFeedback,
  getProductFeedbackById,
  updateProductFeedback,
  deleteProductFeedback,
} from "./storeProductFeedback.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const storeProductFeedbackRouter = Router();

storeProductFeedbackRouter.post("/", isLoggedIn, validate(storeProductFeedbackValidation), createProductFeedback);
storeProductFeedbackRouter.get("/", isLoggedIn, getAllProductFeedback);
storeProductFeedbackRouter.get("/:id", isLoggedIn, getProductFeedbackById);
storeProductFeedbackRouter.put("/:id", isLoggedIn, validate(storeProductFeedbackValidation.partial()), updateProductFeedback);
storeProductFeedbackRouter.delete("/:id", isLoggedIn,deleteProductFeedback);

export default storeProductFeedbackRouter;
