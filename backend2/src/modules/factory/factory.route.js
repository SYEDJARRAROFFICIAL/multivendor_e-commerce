import express from "express";
import { upload } from "../../core/middleware/multer.js";

import { validate } from "../../core/middleware/validate.js";
import {
  createFactorySchema,
  updateFactorySchema,
} from "../../shared/validators/factory.validation.js";
import {
  createFactory,
  getFactoryDetails,
  updateFactory,
  deleteFactory,
  getAllFactories,
} from "./factory.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const router = express.Router();

// Routes in single-line format
router.post(
  "/createFactory",
  isLoggedIn("factory-admin"),
  upload.fields([
    { name: "factoryLogo", maxCount: 1 },
    { name: "factoryCoverImage", maxCount: 1 },
    { name: "factoryLicenseImage", maxCount: 1 },
  ]),
  validate(createFactorySchema),
  createFactory
);
router.get("/getFactory", isLoggedIn("factory-admin"), getFactoryDetails);
router.put(
  "/updateFactory",
  isLoggedIn("factory-admin"),
  upload.fields([
    { name: "factoryLogo", maxCount: 1 },
    { name: "factoryCoverImage", maxCount: 1 },
    { name: "factoryLicenseImage", maxCount: 1 },
  ]),
  validate(updateFactorySchema),
  updateFactory
);
router.delete("/deleteFactory", isLoggedIn("factory-admin"), deleteFactory);
router.get(
  "/getAllFactories",
  isLoggedIn("superAdmin", "factoryAdmin"),
  getAllFactories
);

export default router;
