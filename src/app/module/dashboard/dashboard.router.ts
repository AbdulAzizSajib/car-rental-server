import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { dashboardController } from "./dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get(
  "/summary",
  checkAuth(UserRole.ADMIN),
  dashboardController.getSummary,
);

dashboardRouter.get(
  "/recent-bookings",
  checkAuth(UserRole.ADMIN),
  dashboardController.getRecentBookings,
);

dashboardRouter.get(
  "/booking-status-count",
  checkAuth(UserRole.ADMIN),
  dashboardController.getBookingStatusCount,
);

export default dashboardRouter;
