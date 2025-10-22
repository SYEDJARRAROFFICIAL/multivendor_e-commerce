import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
import { createStore, getStoreDetails, updateStore, deleteStore,getAllStores } from "./store.controller.js";
import { validate } from "../../core/middleware/validate.js";
import { createStoreSchema,updateStoreSchema } from "../../shared/validators/store.validation.js";

const storeRouter = express.Router();

// All routes protected, only store-admin can access
storeRouter.post("/createStore", isLoggedIn, authorizeRoles("store-admin"),  validate(createStoreSchema),createStore);
storeRouter.get("/getStore", isLoggedIn, authorizeRoles("store-admin"), getStoreDetails);
storeRouter.put("/updateStore", isLoggedIn, authorizeRoles("store-admin"),validate(updateStoreSchema), updateStore);
storeRouter.delete("/deleteStore", isLoggedIn, authorizeRoles("store-admin"), deleteStore);
storeRouter.get("/getAllStores", isLoggedIn, authorizeRoles("super-admin"), getAllStores);

export default storeRouter;
