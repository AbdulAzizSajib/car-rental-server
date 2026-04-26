import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

const paymentRouter = Router();

// User routes
paymentRouter.post(
  "/",
  checkAuth(UserRole.USER),
  validateRequest(paymentValidation.createPaymentSchema),
  paymentController.createPayment,
);

paymentRouter.get(
  "/my",
  checkAuth(UserRole.USER),
  paymentController.getMyPayments,
);

paymentRouter.get(
  "/:id",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  paymentController.getSinglePayment,
);

// Admin routes
paymentRouter.get(
  "/",
  checkAuth(UserRole.ADMIN),
  paymentController.getAllPayments,
);

paymentRouter.patch(
  "/:id/status",
  checkAuth(UserRole.ADMIN),
  validateRequest(paymentValidation.updatePaymentStatusSchema),
  paymentController.updatePaymentStatus,
);

export default paymentRouter;
