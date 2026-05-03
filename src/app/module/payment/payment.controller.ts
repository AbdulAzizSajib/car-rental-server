import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { paymentService } from "./payment.service";
import { UserRole } from "../../../generated/prisma/enums";

const createStripeCheckout = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  const result = await paymentService.createStripeCheckoutSession(
    req.user!.userId,
    bookingId,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Stripe checkout session created",
    data: result,
  });
});

const stripeWebhook = async (req: Request, res: Response) => {
  const signatureHeader = req.headers["stripe-signature"];
  const signature = Array.isArray(signatureHeader)
    ? signatureHeader[0]
    : signatureHeader;

  if (!signature) {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  try {
    const result = await paymentService.handleStripeWebhook(
      req.body,
      signature,
    );
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    res.status(400).json({ error: message });
  }
};

const verifyStripePayment = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params as { sessionId: string };
  const result = await paymentService.verifyStripePayment(
    sessionId,
    req.user!.userId,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payment verified",
    data: result,
  });
});

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createPayment(req.user!.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Payment created successfully",
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getMyPayments(
    req.user!.userId,
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payments fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const isAdmin = req.user!.role === UserRole.ADMIN;
  const result = await paymentService.getSinglePayment(
    id,
    req.user!.userId,
    isAdmin,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payment fetched successfully",
    data: result,
  });
});

const updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await paymentService.updatePaymentStatus(id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payment status updated successfully",
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getAllPayments(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All payments fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const paymentController = {
  createPayment,
  getMyPayments,
  getSinglePayment,
  updatePaymentStatus,
  getAllPayments,
  createStripeCheckout,
  stripeWebhook,
  verifyStripePayment,
};
