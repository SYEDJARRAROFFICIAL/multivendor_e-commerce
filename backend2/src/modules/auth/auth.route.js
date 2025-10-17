import Router from "express";
import { validate } from "../../core/middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} from "../../shared/validators/auth.validator.js";
import {
  registerUser,
  verifyUserMail,
  loginUser,
  logoutUser,
  getAccessToken,
  forgotPasswordMail,
  resetPassword,
} from "./auth.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const authRouter = Router();

authRouter.post("/register-user", validate(registerSchema), registerUser);
authRouter.post("/login-user", validate(loginSchema), loginUser);
authRouter.post(
  "/logout-user",
  isLoggedIn("buyer", "store-admin", "factory-admin"),
  logoutUser
);
authRouter.get("/verify-mail/:token", verifyUserMail);
authRouter.get("/get-access-token", getAccessToken);
authRouter.post("/forgot-password-mail", forgotPasswordMail);
authRouter.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPassword
);

export default authRouter;
