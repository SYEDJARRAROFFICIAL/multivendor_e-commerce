import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./src/core/middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import authRouter from "./src/modules/auth/auth.route.js";
import authAdminRouter from "./src/modules/authAdmin/authAdmin.route.js";
import userRouter from "./src/modules/user/user.route.js";
import adminActionRouter from "./src/modules/authAdmin/adminAction.route.js";
import categoryRouter from "./src/modules/category/category.route.js";
// Store Routers
import storeRouter from "./src/modules/store/store.route.js";
import storeProductRouter from "./src/modules/store/storeProduct.route.js";
import storeProductCategoryRouter from "./src/modules/store/storeProductCategory.route.js";
import storeProductReviewRouter from "./src/modules/store/storeProductReview.route.js";
import storeFeedbackRouter from "./src/modules/store/storeFeedback.route.js";
import storeProductFeedbackRouter from "./src/modules/store/storeProductFeedback.route.js";
import storeTransactionRouter from "./src/modules/store/storeTransaction.route.js";
import storeOrderRouter from "./src/modules/store/storeOrder.route.js";

// Factory Router
import factoryRouter from "./src/modules/factory/factory.route.js";
import factoryProductCategoryRouter from "./src/modules/factory/factoryProductCategory.route.js";
import factoryProductRouter from "./src/modules/factory/factoryProduct.route.js";
import factoryFeedbackRouter from "./src/modules/factory/factoryFeedback.route.js";
import factoryProductFeedbackRoutes from "./src/modules/factory/factoryProductFeedback.route.js";
import FactoryProductReviewRoutes from "./src/modules/factory/factoryProductReview.route.js";
import factoryOrderRouter from "./src/modules/factory/factoryOrder.route.js";
import factoryTransactionRouter from "./src/modules/factory/factoryTransaction.route.js";

const app = express();

dotenv.config();

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/authAdmin", authAdminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin/actions", adminActionRouter);
app.use("/api/v1/category", categoryRouter);
// Store Routes
app.use("/api/v1/store", storeRouter);
app.use("/api/v1/store/products", storeProductRouter);
app.use("/api/v1/store-product-category", storeProductCategoryRouter);
app.use("/api/v1/store-product-reviews", storeProductReviewRouter);
app.use("/api/v1/store-feedbacks", storeFeedbackRouter);
app.use("/api/v1/store-product-feedbacks", storeProductFeedbackRouter);
app.use("/api/v1/store-transactions", storeTransactionRouter);
app.use("/api/v1/store-orders", storeOrderRouter);

// Factory Routes
app.use("/api/v1/factory", factoryRouter);
app.use("/api/v1/factory/products", factoryProductRouter);
app.use("/api/v1/factory-product-category", factoryProductCategoryRouter);
app.use("/api/v1/factory-feedback", factoryFeedbackRouter);
app.use("/api/v1/factory-product-feedbacks", factoryProductFeedbackRoutes);
app.use("/api/v1/factory-product-reviews", FactoryProductReviewRoutes);
app.use("/api/v1/factory-orders", factoryOrderRouter);
app.use("/api/v1/factory/transactions", factoryTransactionRouter);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Server is running smoothly - Module Structure",
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

export default app;
