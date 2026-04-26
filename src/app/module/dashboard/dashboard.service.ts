import { prisma } from "../../lib/prisma";
import { BookingStatus } from "../../../generated/prisma/enums";

const getSummary = async () => {
  const [
    totalCars,
    totalBookings,
    totalUsers,
    totalRevenue,
    activeBookings,
    completedBookings,
  ] = await Promise.all([
    prisma.car.count(),
    prisma.booking.count(),
    prisma.user.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
    prisma.booking.count({
      where: { status: { in: [BookingStatus.CONFIRMED, BookingStatus.ONGOING] } },
    }),
    prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
  ]);

  return {
    totalCars,
    totalBookings,
    totalUsers,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    activeBookings,
    completedBookings,
  };
};

const getRecentBookings = async () => {
  return prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      car: { select: { id: true, name: true, brand: true } },
    },
  });
};

const getBookingStatusCount = async () => {
  const counts = await prisma.booking.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const result = Object.values(BookingStatus).reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {} as Record<BookingStatus, number>,
  );

  counts.forEach(({ status, _count }) => {
    result[status] = _count._all;
  });

  return result;
};

export const dashboardService = {
  getSummary,
  getRecentBookings,
  getBookingStatusCount,
};
