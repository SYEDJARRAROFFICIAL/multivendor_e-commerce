import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { StoreOrders } from "../../models/StoreOrder.model.js";
import { storeOrderValidation } from "../../shared/validators/store.validation.js";

// CREATE ORDER
export const createOrder = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const storeId = req.params.storeId;
  const userId = req.user._id;

  // Validate request body (products, totalAmount, etc.)
  const data = storeOrderValidation.parse(req.body);

  // Assign storeId and userId
  data.storeId = storeId;
  data.userId = userId;

  // Verify totalAmount matches products (optional but safe)
  const calculatedTotal = data.products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);
  if (calculatedTotal !== data.totalAmount) {
    throw new ApiError(400, "Total amount mismatch");
  }

  const order = await StoreOrders.create(data);

  return res.status(201).json(new ApiResponse(201, order, "Order created successfully"));
});

// READ ALL ORDERS
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await StoreOrders.find();
  return res.status(200).json(new ApiResponse(200, orders, "All orders fetched successfully"));
});

// READ SINGLE ORDER
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await StoreOrders.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

// UPDATE ORDER
export const updateOrder = asyncHandler(async (req, res) => {
  const data = storeOrderValidation.partial().parse(req.body);

  if (data.products) {
    data.totalAmount = data.products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);
  }

  const updatedOrder = await StoreOrders.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!updatedOrder) throw new ApiError(404, "Order not found");
  return res.status(200).json(new ApiResponse(200, updatedOrder, "Order updated successfully"));
});

// DELETE ORDER
export const deleteOrder = asyncHandler(async (req, res) => {
  const deletedOrder = await StoreOrders.findByIdAndDelete(req.params.id);
  if (!deletedOrder) throw new ApiError(404, "Order not found");
  return res.status(200).json(new ApiResponse(200, {}, "Order deleted successfully"));
});
