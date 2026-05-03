import { Router } from "express";
import { z } from "zod";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

const paymentRouter: Router = Router();

// Stripe routes
paymentRouter.post(
  "/stripe/create-checkout",
  checkAuth(UserRole.USER),
  validateRequest(z.object({ bookingId: z.uuid() })),
  paymentController.createStripeCheckout,
);

// Raw body parser is applied at the app level for this path (see app.ts)
paymentRouter.post("/stripe/webhook", paymentController.stripeWebhook);

paymentRouter.get(
  "/stripe/verify/:sessionId",
  checkAuth(UserRole.USER),
  paymentController.verifyStripePayment,
);

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
