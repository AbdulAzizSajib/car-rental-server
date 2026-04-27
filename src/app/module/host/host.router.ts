import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { hostController } from "./host.controller";
import { hostValidation } from "./host.validation";

const hostRouter = Router();

// Any authenticated USER can apply to become a host
hostRouter.post("/become-host", checkAuth(UserRole.USER), hostController.becomeHost);

// Host-scoped routes
hostRouter.get("/me", checkAuth(UserRole.HOST), hostController.getMyProfile);

hostRouter.patch(
  "/me",
  checkAuth(UserRole.HOST),
  validateRequest(hostValidation.updateHostProfileSchema),
  hostController.updateMyProfile,
);

hostRouter.get("/me/cars", checkAuth(UserRole.HOST), hostController.getMyCars);

hostRouter.get("/me/bookings", checkAuth(UserRole.HOST), hostController.getMyCarBookings);

hostRouter.get("/me/dashboard", checkAuth(UserRole.HOST), hostController.getDashboard);

// Admin routes
hostRouter.get("/", checkAuth(UserRole.ADMIN), hostController.getAllHosts);

hostRouter.patch("/:id/verify", checkAuth(UserRole.ADMIN), hostController.verifyHost);

export default hostRouter;
