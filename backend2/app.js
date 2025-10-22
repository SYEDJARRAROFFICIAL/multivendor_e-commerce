import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./src/core/middleware/errorHandler.js";
import authRouter from "./src/modules/auth/auth.route.js";
import authAdminRouter from "./src/modules/authAdmin/authAdmin.route.js";
import userRouter from "./src/modules/user/user.route.js";
import cookieParser from "cookie-parser";
import adminActionRouter from "./src/modules/authAdmin/adminAction.route.js";
import categoryRouter from "./src/modules/category/category.route.js";

const app = express();

dotenv.config();

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/authAdmin", authAdminRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin/actions", adminActionRouter);
app.use("/api/v1/category", categoryRouter);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Server is running smoothly - Module Structure",
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

export default app;
