import Router from "express";
import { validate } from "../../core/middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} from "../../shared/validators/authAdmin.validator.js";
import {
  registerAdmin,
  verifyAdminMail,
  loginAdmin,
  logoutAdmin,
  getAccessToken,
  forgotPasswordMail,
  resetPassword,
} from "./authAdmin.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedIn.js";

const authAdminRouter = Router();

authAdminRouter.post(
  "/register-admin",
  validate(registerSchema),
  registerAdmin
);
authAdminRouter.post("/login-admin", validate(loginSchema), loginAdmin);
authAdminRouter.post(
  "/logout-admin",
  isLoggedIn(
    "superAdmin",
    "analystAdmin",
    "factoryAdmin",
    "storeAdmin",
    "buyerAdmin"
  ),
  logoutAdmin
);
authAdminRouter.get("/verify-mail/:token", verifyAdminMail);
authAdminRouter.get("/get-access-token", getAccessToken);
authAdminRouter.post("/forgot-password-mail", forgotPasswordMail);
authAdminRouter.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPassword
);

export default authAdminRouter;
