import Router from "express";
import { validate } from "../../core/middleware/validate.js";
import {
  createFactoryOrder,
  getAllFactoryOrders,
  getFactoryOrderById,
  deleteFactoryOrder,
} from "./factoryOrder.controller.js";
import { factoryOrderValidation } from "../../shared/validators/factory.validation.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const factoryOrderRouter = Router();

factoryOrderRouter.post(
  "/",
  isLoggedIn("store-admin"),
  validate(factoryOrderValidation),
  createFactoryOrder
);

factoryOrderRouter.get("/", getAllFactoryOrders);
factoryOrderRouter.get("/:id", getFactoryOrderById);
factoryOrderRouter.delete(
  "/:id",
  isLoggedIn("store-admin", "factory-admin", "superAdmin"),
  deleteFactoryOrder
);

export default factoryOrderRouter;
