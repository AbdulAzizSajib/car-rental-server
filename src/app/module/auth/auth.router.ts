import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";


const authRouter: Router = Router();

authRouter.post("/register", authController.registerUser);
authRouter.post("/login", authController.loginUser);

authRouter.get(
  "/me",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  authController.getMe,
);
authRouter.post("/refresh-token", authController.getNewToken);
authRouter.post(
  "/change-password",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  authController.changePassword,
);
authRouter.post(
  "/logout",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  authController.logoutUser,
);

authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/resend-otp", authController.resendOTP);

authRouter.post("/forget-password", authController.forgetPassword);
authRouter.post("/reset-password", authController.resetPassword);

authRouter.get("/login/google", authController.googleLogin);
authRouter.get("/google/success", authController.googleLoginSuccess);
authRouter.get("/oauth/error", authController.handleOAuthError);

export default authRouter;
