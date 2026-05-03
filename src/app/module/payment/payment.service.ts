import status from "http-status";
import Stripe from "stripe";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { envVars } from "../../config/env";
import { Prisma } from "../../../generated/prisma/client";
import {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma/enums";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { ICreatePayment, IUpdatePaymentStatus } from "./payment.interface";

const createStripeCheckoutSession = async (
  userId: string,
  bookingId: string,
) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { car: true, payment: true, user: true },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  const existingPayment = booking.payment;
  if (existingPayment?.status === PaymentStatus.PAID) {
    throw new AppError(status.CONFLICT, "Booking already paid");
  }

  let payment = existingPayment;
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        method: PaymentMethod.STRIPE,
        status: PaymentStatus.PENDING,
      },
    });
  }

  const endDateLabel = booking.endDate
    ? new Date(booking.endDate).toLocaleDateString()
    : "open-ended";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: booking.user.email,
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `${booking.car.name} - Booking #${booking.id.slice(0, 8)}`,
            description: `Booking from ${new Date(booking.startDate).toLocaleDateString()} to ${endDateLabel}`,
          },
          unit_amount: Math.round(Number(booking.totalPrice) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
      paymentId: payment.id,
      userId,
    },
    success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/payment/cancel?booking_id=${booking.id}`,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { transactionId: session.id, method: PaymentMethod.STRIPE },
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
};

const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      envVars.STRIPE.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new AppError(status.BAD_REQUEST, `Webhook Error: ${message}`);
  }

  // Idempotency check
  const existingWebhookEvent = await prisma.payment.findFirst({
    where: { stripeEventId: event.id },
  });

  if (existingWebhookEvent) {
    return { received: true, alreadyProcessed: true };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata ?? {};
      const bookingId = metadata.bookingId;
      const paymentId = metadata.paymentId;

      if (!bookingId || !paymentId) {
        throw new AppError(
          status.BAD_REQUEST,
          "Missing booking or payment metadata on session",
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.PAID,
            paidAt: new Date(),
            gatewayResponse: session as unknown as Prisma.InputJsonValue,
            stripeEventId: event.id,
          },
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CONFIRMED },
        });
      });

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;

      if (!paymentId) break;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.CANCELLED,
          gatewayResponse: session as unknown as Prisma.InputJsonValue,
          stripeEventId: event.id,
        },
      });
      break;
    }
  }

  return { received: true };
};

const verifyStripePayment = async (sessionId: string, userId: string) => {
  const payment = await prisma.payment.findFirst({
    where: {
      transactionId: sessionId,
      booking: { userId },
    },
    include: {
      booking: { include: { car: true } },
    },
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found");
  }

  return payment;
};

const createPayment = async (userId: string, payload: ICreatePayment) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  if (booking.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this booking",
    );
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId: payload.bookingId },
  });

  if (existingPayment?.status === PaymentStatus.PAID) {
    throw new AppError(status.CONFLICT, "This booking has already been paid");
  }

  if (existingPayment) {
    return prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        method: payload.method,
        transactionId: payload.transactionId ?? null,
        gatewayResponse:
          (payload.gatewayResponse as Prisma.InputJsonValue) ?? Prisma.DbNull,
        status: PaymentStatus.PENDING,
        paidAt: null,
      },
      include: { booking: true },
    });
  }

  return prisma.payment.create({
    data: {
      bookingId: payload.bookingId,
      amount: booking.totalPrice,
      method: payload.method,
      transactionId: payload.transactionId ?? null,
      gatewayResponse:
        (payload.gatewayResponse as Prisma.InputJsonValue) ?? Prisma.DbNull,
    },
    include: { booking: true },
  });
};

const getMyPayments = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    filterableFields: ["status"],
    sortableFields: ["createdAt", "amount"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const finalWhere = { ...where, booking: { userId } };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: finalWhere,
      orderBy,
      skip,
      take,
      include: {
        booking: {
          include: { car: { include: { images: true } } },
        },
      },
    }),
    prisma.payment.count({ where: finalWhere }),
  ]);

  return { data: payments, meta: buildMeta(total, page, limit) };
};

const getSinglePayment = async (
  paymentId: string,
  userId: string,
  isAdmin: boolean,
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: { car: { include: { images: true } }, user: true },
      },
    },
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found");
  }

  if (!isAdmin && payment.booking.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this payment",
    );
  }

  return payment;
};

const updatePaymentStatus = async (
  paymentId: string,
  payload: IUpdatePaymentStatus,
) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found");
  }

  const updateData: Prisma.PaymentUpdateInput = {
    status: payload.status,
    paidAt: payload.status === PaymentStatus.PAID ? new Date() : null,
  };
  if (payload.transactionId) updateData.transactionId = payload.transactionId;
  if (payload.gatewayResponse)
    updateData.gatewayResponse =
      payload.gatewayResponse as Prisma.InputJsonValue;

  return prisma.payment.update({ where: { id: paymentId }, data: updateData });
};

const getAllPayments = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    filterableFields: ["status"],
    sortableFields: ["createdAt", "amount"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        booking: {
          include: {
            car: { select: { id: true, name: true, brand: true } },
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { data: payments, meta: buildMeta(total, page, limit) };
};

export const paymentService = {
  createPayment,
  getMyPayments,
  getSinglePayment,
  updatePaymentStatus,
  getAllPayments,
  createStripeCheckoutSession,
  handleStripeWebhook,
  verifyStripePayment,
};
