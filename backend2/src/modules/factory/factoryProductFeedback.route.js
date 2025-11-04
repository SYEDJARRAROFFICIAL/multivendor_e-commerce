import express from "express";
import {
  createFactoryProductFeedback,
  getAllFactoryProductFeedbacks,
  getFactoryProductFeedbackById,
  updateFactoryProductFeedback,
  deleteFactoryProductFeedback,
} from "./factoryProductFeedback.controller.js";
import { upload } from "../../core/middleware/multer.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const router = express.Router();

router.post(
  "/",
  isLoggedIn("store-admin"),
  upload.single("factoryProductImage"),
  createFactoryProductFeedback
);
router.get("/", getAllFactoryProductFeedbacks);
router.get("/:id", getFactoryProductFeedbackById);
router.put(
  "/:id",
  isLoggedIn("store-admin"),
  upload.single("factoryProductImage"),
  updateFactoryProductFeedback
);
router.delete("/:id", isLoggedIn("store-admin"), deleteFactoryProductFeedback);

export default router;
