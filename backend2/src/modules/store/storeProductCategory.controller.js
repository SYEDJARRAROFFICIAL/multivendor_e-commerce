import { StoreProductCategory } from "../../models/StoreProductCategory.model.js";
import Store from "../../models/Store.model.js";

// ✅ CREATE CATEGORY (Only by Store Owner)
export const createStoreProductCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { categoryName, categoryLogo } = req.body;

    const store = await Store.findOne({ userID: userId });
    if (!store)
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });

    const category = await StoreProductCategory.create({
      categoryName,
      categoryLogo,
      storeId: store._id,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ GET ALL CATEGORIES (By store owner)
export const getAllStoreProductCategories = async (req, res) => {
  try {
    const userId = req.user._id;

    const store = await Store.findOne({ userID: userId });
    if (!store)
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });

    const categories = await StoreProductCategory.find({ storeId: store._id });

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ GET SINGLE CATEGORY
export const getStoreProductCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await StoreProductCategory.findById(id);

    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ UPDATE CATEGORY
export const updateStoreProductCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, categoryLogo } = req.body;

    const updatedCategory = await StoreProductCategory.findByIdAndUpdate(
      id,
      { categoryName, categoryLogo },
      { new: true }
    );

    if (!updatedCategory)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ DELETE CATEGORY
export const deleteStoreProductCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await StoreProductCategory.findByIdAndDelete(id);

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
