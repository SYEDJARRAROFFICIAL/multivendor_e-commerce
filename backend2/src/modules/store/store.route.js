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

const storeRouter = express.Router();

// All routes protected, only store-admin can access
storeRouter.post(
  "/createStore",
  isLoggedIn("store-admin"),
  validate(createStoreSchema),
  createStore
);
storeRouter.get("/getStore", isLoggedIn("store-admin"), getStoreDetails);
storeRouter.put(
  "/updateStore",
  isLoggedIn("store-admin"),
  validate(updateStoreSchema),
  updateStore
);
storeRouter.delete("/deleteStore", isLoggedIn("store-admin"), deleteStore);
storeRouter.get(
  "/getAllStores",
  isLoggedIn("superAdmin,storeAdmin,analystAdmin"),
  getAllStores
);

export default storeRouter;
