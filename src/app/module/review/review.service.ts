import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { BookingStatus } from "../../../generated/prisma/enums";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { ICreateReview } from "./review.interface";

const createReview = async (userId: string, payload: ICreateReview) => {
  const car = await prisma.car.findUnique({ where: { id: payload.carId } });

  if (!car) {
    throw new AppError(status.NOT_FOUND, "Car not found");
  }

  const completedBooking = await prisma.booking.findFirst({
    where: {
      userId,
      carId: payload.carId,
      status: BookingStatus.COMPLETED,
    },
  });

  if (!completedBooking) {
    throw new AppError(
      status.FORBIDDEN,
      "You can only review a car after completing a booking",
    );
  }

  const existing = await prisma.review.findUnique({
    where: { userId_carId: { userId, carId: payload.carId } },
  });

  if (existing) {
    throw new AppError(status.CONFLICT, "You have already reviewed this car");
  }

  return prisma.review.create({
    data: { userId, carId: payload.carId, rating: payload.rating, comment: payload.comment },
    include: { user: { select: { id: true, name: true } } },
  });
};

const getCarReviews = async (carId: string, query: Record<string, unknown>) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });

  if (!car) {
    throw new AppError(status.NOT_FOUND, "Car not found");
  }

  const { orderBy, skip, take, page, limit } = buildQuery(query, {
    sortableFields: ["createdAt", "rating"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const where = { carId };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.review.count({ where }),
  ]);

  return { data: reviews, meta: buildMeta(total, page, limit) };
};

const deleteReview = async (id: string) => {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  await prisma.review.delete({ where: { id } });
};

export const reviewService = { createReview, getCarReviews, deleteReview };
