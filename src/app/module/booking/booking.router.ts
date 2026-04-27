import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { bookingController } from "./booking.controller";
import { bookingValidation } from "./booking.validation";

const bookingRouter = Router();

// User + Host routes (hosts can rent cars too)
bookingRouter.post(
  "/",
  checkAuth(UserRole.USER, UserRole.HOST),
  validateRequest(bookingValidation.createBookingSchema),
  bookingController.createBooking,
);

bookingRouter.get(
  "/my",
  checkAuth(UserRole.USER, UserRole.HOST),
  bookingController.getMyBookings,
);

bookingRouter.get(
  "/:id",
  checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.HOST),
  bookingController.getSingleBooking,
);

bookingRouter.patch(
  "/:id/cancel",
  checkAuth(UserRole.USER, UserRole.HOST),
  bookingController.cancelBooking,
);

// Admin routes
bookingRouter.get(
  "/",
  checkAuth(UserRole.ADMIN),
  bookingController.getAllBookings,
);

bookingRouter.patch(
  "/:id/status",
  checkAuth(UserRole.ADMIN),
  validateRequest(bookingValidation.updateStatusSchema),
  bookingController.updateBookingStatus,
);

bookingRouter.patch(
  "/:id/assign-driver",
  checkAuth(UserRole.ADMIN),
  validateRequest(bookingValidation.assignDriverSchema),
  bookingController.assignDriver,
);

export default bookingRouter;
