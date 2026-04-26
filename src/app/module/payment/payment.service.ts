import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { ICreatePayment, IUpdatePaymentStatus } from "./payment.interface";

const createPayment = async (userId: string, payload: ICreatePayment) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  if (booking.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this booking");
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
        status: PaymentStatus.PENDING,
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
    throw new AppError(status.FORBIDDEN, "You do not have access to this payment");
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

  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: payload.status,
      ...(payload.transactionId && { transactionId: payload.transactionId }),
    },
  });
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
};
