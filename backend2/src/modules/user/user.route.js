import Router from "express";
import { getAllUsers } from "./user.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";
import { upload } from "../../core/middleware/multer.js";
const userRouter = Router();

userRouter.get("/all-users", getAllUsers);

export default userRouter;
