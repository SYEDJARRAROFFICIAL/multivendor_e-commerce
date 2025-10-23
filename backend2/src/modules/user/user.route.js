import Router from "express";
import {
  updateUserAvatar,
  deleteUserAvatar,
  getUserProfile,
} from "./user.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { upload } from "../../core/middleware/multer.js";
const userRouter = Router();

userRouter.patch(
  "/update-avatar/:userId",
  isLoggedIn(),
  upload.single("avatar"),
  updateUserAvatar
);
userRouter.delete("/delete-avatar/:userId", isLoggedIn(), deleteUserAvatar);
userRouter.get("/profile/:userId", isLoggedIn(), getUserProfile);

export default userRouter;
