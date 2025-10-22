import Store from "../../models/Store.model.js";
import StoreProduct from "../../models/StoreProduct.model.js";
// import Factory from "../../models/Factory.model.js";
// import FactoryProduct from "../../models/FactoryProduct.model.js";
import AdminActions from "../../models/adminAction.model.js";
import { asyncHandler } from "../../core/utils/async-handler.js";

// Helper to log admin actions
const logAdminAction = async ({ adminId, actionType, targetTable, targetId, notes }) => {
  await AdminActions.create({ adminId, actionType, targetTable, targetId, notes });
};

// ---------- STORE ACTIONS ----------
export const verifyStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) return res.status(404).json({ message: "Store not found" });

  store.storeStatus = "live";
  await store.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "VerifyStore",
    targetTable: "Store",
    targetId: store._id,
    notes: req.body.notes || "Store verified",
  });

  res.status(200).json({ success: true, message: "Store verified successfully" });
});

export const rejectStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) return res.status(404).json({ message: "Store not found" });

  store.storeStatus = "rejected";
  await store.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "RejectStore",
    targetTable: "Store",
    targetId: store._id,
    notes: req.body.notes || "Store rejected",
  });

  res.status(200).json({ success: true, message: "Store rejected successfully" });
});

export const suspendStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) return res.status(404).json({ message: "Store not found" });

  store.isSuspended = true;
  await store.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "SuspendStore",
    targetTable: "Store",
    targetId: store._id,
    notes: req.body.notes || "Store suspended",
  });

  res.status(200).json({ success: true, message: "Store suspended successfully" });
});

export const blockStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) return res.status(404).json({ message: "Store not found" });

  store.isBlocked = true;
  await store.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "BlockStore",
    targetTable: "Store",
    targetId: store._id,
    notes: req.body.notes || "Store blocked",
  });

  res.status(200).json({ success: true, message: "Store blocked successfully" });
});

// ---------- PRODUCT ACTIONS ----------
export const verifyProduct = asyncHandler(async (req, res) => {
  const product = await StoreProduct.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.productStatus = "live";
  await product.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "VerifyProduct",
    targetTable: "StoreProduct",
    targetId: product._id,
    notes: req.body.notes || "Product verified",
  });

  res.status(200).json({ success: true, message: "Product verified successfully" });
});

export const rejectProduct = asyncHandler(async (req, res) => {
  const product = await StoreProduct.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.productStatus = "rejected";
  await product.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "RejectProduct",
    targetTable: "StoreProduct",
    targetId: product._id,
    notes: req.body.notes || "Product rejected",
  });

  res.status(200).json({ success: true, message: "Product rejected successfully" });
});
