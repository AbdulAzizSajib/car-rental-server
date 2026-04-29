import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { BookingStatus } from "../../../generated/prisma/enums";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import {
  IAssignDriver,
  ICreateBooking,
  IUpdateBookingStatus,
} from "./booking.interface";

const createBooking = async (userId: string, payload: ICreateBooking) => {
  const car = await prisma.car.findUnique({ where: { id: payload.carId } });

  if (!car) {
    throw new AppError(status.NOT_FOUND, "Car not found");
  }

  if (!car.isAvailable) {
    throw new AppError(status.CONFLICT, "Car is not available");
  }

  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  if (endDate <= startDate) {
    throw new AppError(status.BAD_REQUEST, "End date must be after start date");
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      carId: payload.carId,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.ONGOING],
      },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
  });

  if (conflict) {
    throw new AppError(status.CONFLICT, "Car is already booked for the selected dates");
  }

  if (payload.driverId) {
    const driver = await prisma.driver.findUnique({
      where: { id: payload.driverId },
    });

    if (!driver) {
      throw new AppError(status.NOT_FOUND, "Driver not found");
    }

    if (!driver.isAvailable) {
      throw new AppError(status.CONFLICT, "Driver is not available");
    }
  }

  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const basePrice = car.pricePerDay * days;
  const serviceFee = 0;
  const totalPrice = basePrice + serviceFee;

  const booking = await prisma.booking.create({
    data: {
      userId,
      carId: payload.carId,
      driverId: payload.driverId ?? null,
      pickupLocation: payload.pickupLocation,
      dropLocation: payload.dropLocation,
      startDate,
      endDate,
      basePrice,
      serviceFee,
      totalPrice,
      tripType: payload.tripType ?? null,
      contactNumber: payload.contactNumber ?? null,
      specialRequest: payload.specialRequest ?? null,
    },
    include: { car: { include: { images: true } }, driver: true },
  });

  return booking;
};

const getMyBookings = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    filterableFields: ["status"],
    sortableFields: ["createdAt", "startDate", "totalPrice"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const finalWhere = { ...where, userId };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: finalWhere,
      orderBy,
      skip,
      take,
      include: { car: { include: { images: true } }, driver: true },
    }),
    prisma.booking.count({ where: finalWhere }),
  ]);

  return { data: bookings, meta: buildMeta(total, page, limit) };
};

const getSingleBooking = async (bookingId: string, userId: string, isAdmin: boolean) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { car: { include: { images: true } }, driver: true },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  if (!isAdmin && booking.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this booking");
  }

  return booking;
};

const cancelBooking = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  if (booking.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this booking");
  }

  if (
    booking.status !== BookingStatus.PENDING &&
    booking.status !== BookingStatus.CONFIRMED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only pending or confirmed bookings can be cancelled",
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });
};

const getAllBookings = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    filterableFields: ["status", "carId", "userId"],
    sortableFields: ["createdAt", "startDate", "totalPrice"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        car: { include: { images: true } },
        driver: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return { data: bookings, meta: buildMeta(total, page, limit) };
};

const updateBookingStatus = async (
  bookingId: string,
  payload: IUpdateBookingStatus,
) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: payload.status },
  });
};

const assignDriver = async (bookingId: string, payload: IAssignDriver) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  const driver = await prisma.driver.findUnique({
    where: { id: payload.driverId },
  });

  if (!driver) {
    throw new AppError(status.NOT_FOUND, "Driver not found");
  }

  if (!driver.isAvailable) {
    throw new AppError(status.CONFLICT, "Driver is not available");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { driverId: payload.driverId },
    include: { driver: true },
  });
};

export const bookingService = {
  createBooking,
  getMyBookings,
  getSingleBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  assignDriver,
};
