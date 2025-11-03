import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import {
  createStore,
  getStoreDetails,
  updateStore,
  deleteStore,
  getAllStores,
} from "./store.controller.js";
import { validate } from "../../core/middleware/validate.js";
import {
  createStoreSchema,
  updateStoreSchema,
} from "../../shared/validators/store.validation.js";
import { upload } from "../../core/middleware/multer.js";
const storeRouter = express.Router();

const storeImages = upload.fields([
  { name: "storeLogo", maxCount: 1 },
  { name: "storeCoverImage", maxCount: 1 },
]);

// All routes protected, only store-admin can access
storeRouter.post(
  "/createStore",
  isLoggedIn("store-admin"),
  storeImages,
  validate(createStoreSchema),
  createStore
);
storeRouter.get("/getStore", isLoggedIn("store-admin"), getStoreDetails);
storeRouter.put(
  "/updateStore",
  isLoggedIn("store-admin"),
  storeImages,
  validate(updateStoreSchema.optional()),
  updateStore
);
storeRouter.delete("/deleteStore", isLoggedIn("store-admin"), deleteStore);
storeRouter.get(
  "/getAllStores",
  isLoggedIn("superAdmin,storeAdmin,analystAdmin"),
  getAllStores
);

export default storeRouter;
