import Store from "../../models/Store.model.js";
import StoreProduct from "../../models/StoreProduct.model.js";

/* =============================
   ✅ CREATE PRODUCT
============================= */
export const createProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      productName,
      productDescription,
      productCategoryId,
      price,
      stock,
      productImage,
    } = req.body;

    const store = await Store.findOne({ userID: userId });
    if (!store)
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });

    const product = await StoreProduct.create({
      storeId: store._id,
      productName,
      productDescription,
      productCategoryId: productCategoryId || null,
      price,
      stock,
      productImage,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ GET ALL PRODUCTS (of store owner)
============================= */
export const getAllProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const store = await Store.findOne({ userID: userId });
    if (!store)
      return res.status(404).json({ success: false, message: "Store not found" });

    const products = await StoreProduct.find({ storeId: store._id })
      .populate("productCategoryId", "categoryName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ GET SINGLE PRODUCT (by ID)
============================= */
export const getProductById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const store = await Store.findOne({ userID: userId });
    if (!store)
      return res.status(404).json({ success: false, message: "Store not found" });

    const product = await StoreProduct.findOne({ _id: id, storeId: store._id })
      .populate("productCategoryId", "categoryName");

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ UPDATE PRODUCT
============================= */
export const updateProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const updates = req.body;

    const store = await Store.findOne({ userID: userId });
    if (!store)
      return res.status(404).json({ success: false, message: "Store not found" });

    const product = await StoreProduct.findOneAndUpdate(
      { _id: id, storeId: store._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found or not owned by this store" });

    res.status(200).json({ success: true, message: "Product updated successfully", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ DELETE PRODUCT
============================= */
export const deleteProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const store = await Store.findOne({ userID: userId });
    if (!store)
      return res.status(404).json({ success: false, message: "Store not found" });

    const product = await StoreProduct.findOneAndDelete({ _id: id, storeId: store._id });

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found or not owned by this store" });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
