import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { BookingStatus, UserRole, VerificationStatus } from "../../../generated/prisma/enums";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { IUpdateHostProfile } from "./host.interface";

const becomeHost = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.role !== UserRole.USER) {
    throw new AppError(status.CONFLICT, "User already has a non-default role");
  }

  const [hostProfile] = await prisma.$transaction([
    prisma.hostProfile.create({ data: { userId } }),
    prisma.user.update({ where: { id: userId }, data: { role: UserRole.HOST } }),
  ]);

  return hostProfile;
};

const getMyProfile = async (userId: string) => {
  const profile = await prisma.hostProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      cars: { include: { images: true } },
    },
  });

  if (!profile) {
    throw new AppError(status.NOT_FOUND, "Host profile not found");
  }

  return profile;
};

const updateMyProfile = async (userId: string, payload: IUpdateHostProfile) => {
  const profile = await prisma.hostProfile.findUnique({ where: { userId } });

  if (!profile) {
    throw new AppError(status.NOT_FOUND, "Host profile not found");
  }

  return prisma.hostProfile.update({ where: { userId }, data: payload });
};

const getMyCars = async (userId: string, query: Record<string, unknown>) => {
  const hostProfile = await prisma.hostProfile.findUnique({ where: { userId } });

  if (!hostProfile) {
    throw new AppError(status.NOT_FOUND, "Host profile not found");
  }

  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    searchFields: ["name", "brand", "model"],
    sortableFields: ["pricePerDay", "year", "createdAt"],
    filterableFields: ["brand", "fuelType", "transmission", "isAvailable"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const finalWhere = { ...where, hostId: hostProfile.id };

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where: finalWhere,
      orderBy,
      skip,
      take,
      include: { images: true },
    }),
    prisma.car.count({ where: finalWhere }),
  ]);

  return { data: cars, meta: buildMeta(total, page, limit) };
};

const getMyCarBookings = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const hostProfile = await prisma.hostProfile.findUnique({ where: { userId } });

  if (!hostProfile) {
    throw new AppError(status.NOT_FOUND, "Host profile not found");
  }

  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    filterableFields: ["status"],
    sortableFields: ["createdAt", "startDate", "totalPrice"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const finalWhere = { ...where, car: { hostId: hostProfile.id } };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: finalWhere,
      orderBy,
      skip,
      take,
      include: {
        car: { include: { images: true } },
        user: { select: { id: true, name: true, email: true } },
        driver: true,
      },
    }),
    prisma.booking.count({ where: finalWhere }),
  ]);

  return { data: bookings, meta: buildMeta(total, page, limit) };
};

const getDashboard = async (userId: string) => {
  const hostProfile = await prisma.hostProfile.findUnique({ where: { userId } });

  if (!hostProfile) {
    throw new AppError(status.NOT_FOUND, "Host profile not found");
  }

  const hostId = hostProfile.id;

  const [totalCars, totalBookings, earnings, activeBookings, completedBookings] =
    await Promise.all([
      prisma.car.count({ where: { hostId } }),
      prisma.booking.count({ where: { car: { hostId } } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "PAID", booking: { car: { hostId } } },
      }),
      prisma.booking.count({
        where: {
          car: { hostId },
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.ONGOING] },
        },
      }),
      prisma.booking.count({
        where: { car: { hostId }, status: BookingStatus.COMPLETED },
      }),
    ]);

  return {
    totalCars,
    totalBookings,
    totalEarnings: earnings._sum.amount ?? 0,
    activeBookings,
    completedBookings,
  };
};

// Admin
const getAllHosts = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    filterableFields: ["isVerified", "verificationStatus"],
    sortableFields: ["createdAt"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const [hosts, total] = await Promise.all([
    prisma.hostProfile.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        _count: { select: { cars: true } },
      },
    }),
    prisma.hostProfile.count({ where }),
  ]);

  return { data: hosts, meta: buildMeta(total, page, limit) };
};

const verifyHost = async (hostId: string) => {
  const host = await prisma.hostProfile.findUnique({ where: { id: hostId } });

  if (!host) {
    throw new AppError(status.NOT_FOUND, "Host not found");
  }

  return prisma.hostProfile.update({
    where: { id: hostId },
    data: { isVerified: true, verificationStatus: VerificationStatus.APPROVED },
  });
};

export const hostService = {
  becomeHost,
  getMyProfile,
  updateMyProfile,
  getMyCars,
  getMyCarBookings,
  getDashboard,
  getAllHosts,
  verifyHost,
};
