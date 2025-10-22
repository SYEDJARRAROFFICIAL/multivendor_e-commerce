// src/modules/admin/admin.route.js
import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import {
  verifyStore,
  rejectStore,
  suspendStore,
  blockStore,
  verifyProduct,
  rejectProduct,
} from "./adminAction.controller.js";

const adminActionRouter = express.Router();

adminActionRouter.use(isLoggedIn); // all routes protected

// Store actions
adminActionRouter.post(
  "/store/:id/verify",
  isLoggedIn("superAdmin"),
  verifyStore
);
adminActionRouter.post(
  "/store/:id/reject",
  isLoggedIn("superAdmin"),
  rejectStore
);
adminActionRouter.post(
  "/store/:id/suspend",
  isLoggedIn("superAdmin"),
  suspendStore
);
adminActionRouter.post(
  "/store/:id/block",
  isLoggedIn("superAdmin"),
  blockStore
);

// Product actions
adminActionRouter.post(
  "/product/:id/verify",
  isLoggedIn("superAdmin"),
  verifyProduct
);
adminActionRouter.post(
  "/product/:id/reject",
  isLoggedIn("superAdmin"),
  rejectProduct
);

export default adminActionRouter;
