import Router from "express";
import { validate } from "../../core/middleware/validate.js";
import { storeOrderValidation } from "../../shared/validators/store.validation.js";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "./storeOrder.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
const storeOrderRouter = Router();

// storeId comes from URL, userId from auth
storeOrderRouter.post("/:storeId", isLoggedIn,validate(storeOrderValidation), createOrder);

storeOrderRouter.get("/", getAllOrders);
storeOrderRouter.get("/:id", getOrderById);
storeOrderRouter.put("/:id", isLoggedIn,validate(storeOrderValidation.partial()), updateOrder);
storeOrderRouter.delete("/:id", deleteOrder);

export default storeOrderRouter;
