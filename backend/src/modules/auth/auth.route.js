import Router from "express";
import { validate } from "../../core/middleware/validate.js";
import { registerSchema } from "../../shared/validators/user.validator.js";
import {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  checkUsernameAvailability,
} from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), registerUser);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/resend-verification", resendVerificationEmail);
authRouter.get("/check-username/:userName", checkUsernameAvailability);

export default authRouter;

// import Router from "express";
// import { validate } from "../../core/middleware/validate.js";
// import { registerSchema } from "../../shared/validators/user.validator.js";
// import { registerUser } from "./auth.controller.js";

// const authRouter = Router();

// authRouter.post("/register", validate(registerSchema), registerUser);

// export default authRouter;
