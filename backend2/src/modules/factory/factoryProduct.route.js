import express from "express";
import { upload } from "../../core/middleware/multer.js";
import { validate } from "../../core/middleware/validate.js";
import {
  createFactoryProduct,
  getAllFactoryProducts,
  getFactoryProductById,
  updateFactoryProduct,
  deleteFactoryProduct,
} from "./factoryProduct.controller.js";
import {
  factoryProductSchema,
  updateFactoryProductSchema,
} from "../../shared/validators/factory.validation.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const router = express.Router();

// Routes
router.post(
  "/create",
  isLoggedIn("factory-admin"),
  upload.single("factoryProductImage"),
  validate(factoryProductSchema),
  createFactoryProduct
);
router.get("/getall", isLoggedIn("factory-admin"), getAllFactoryProducts);
router.get("/get/:id", isLoggedIn("factory-admin"), getFactoryProductById);
router.put(
  "/update/:id",
  isLoggedIn("factory-admin"),
  upload.single("factoryProductImage"),
  validate(updateFactoryProductSchema),
  updateFactoryProduct
);
router.delete("/delete/:id", isLoggedIn("factory-admin"), deleteFactoryProduct);

export default router;
