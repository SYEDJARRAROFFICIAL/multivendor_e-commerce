import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "./storeProduct.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
import { validate } from "../../core/middleware/validate.js";
import { storeProductSchema, updateStoreProductSchema } from "../../shared/validators/store.validation.js";

const storeProductRouter = express.Router();

storeProductRouter.post("/create", isLoggedIn, authorizeRoles("store-admin"),validate(storeProductSchema), createProduct);           // Create product
storeProductRouter.get("/getall", isLoggedIn, authorizeRoles("store-admin"), getAllProducts);           // Get all products
storeProductRouter.get("/get/:id", isLoggedIn, authorizeRoles("store-admin"), getProductById);        // Get single product
storeProductRouter.put("/update/:id", isLoggedIn, authorizeRoles("store-admin"),validate(updateStoreProductSchema), updateProduct);         // Update product
storeProductRouter.delete("/delete/:id", isLoggedIn, authorizeRoles("store-admin"), deleteProduct);      // Delete product

export default storeProductRouter;
