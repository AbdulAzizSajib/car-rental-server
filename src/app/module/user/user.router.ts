import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidation } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { multerUpload } from "../../config/multer.config";
import { UserRole } from "../../../generated/prisma/enums";

const userRouter: Router = Router();

// Create admin (OWNER or ADMIN only)
userRouter.post(
  "/create-admin",
  checkAuth(UserRole.ADMIN),
  validateRequest(UserValidation.createAdminZodSchema),
  userController.createAdmin,
);

userRouter.patch(
  "/me",
  checkAuth(UserRole.ADMIN, UserRole.USER , UserRole.DRIVER),
  multerUpload.single("profilePhoto"),
  validateRequest(UserValidation.updateProfileZodSchema),
  userController.updateProfile,
);

export default userRouter;
