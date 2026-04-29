import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { ICreateDriver, IUpdateDriver } from "./driver.interface";

const createDriver = async (payload: ICreateDriver) => {
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const existing = await prisma.driver.findUnique({
    where: { userId: payload.userId },
  });

  if (existing) {
    throw new AppError(status.CONFLICT, "Driver profile already exists for this user");
  }

  return prisma.driver.create({
    data: {
      userId: payload.userId,
      licenseNo: payload.licenseNo,
      ...(payload.licenseImage !== undefined && { licenseImage: payload.licenseImage }),
      ...(payload.yearsOfExperience !== undefined && { yearsOfExperience: payload.yearsOfExperience }),
      ...(payload.location !== undefined && { location: payload.location }),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
};

const getAllDrivers = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    filterableFields: ["isAvailable", "status", "location"],
    searchFields: ["licenseNo"],
    sortableFields: ["createdAt", "averageRating", "totalTrips"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.driver.count({ where }),
  ]);

  return { data: drivers, meta: buildMeta(total, page, limit) };
};

const getSingleDriver = async (id: string) => {
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!driver) {
    throw new AppError(status.NOT_FOUND, "Driver not found");
  }

  return driver;
};

const updateDriver = async (id: string, payload: IUpdateDriver) => {
  const driver = await prisma.driver.findUnique({ where: { id } });

  if (!driver) {
    throw new AppError(status.NOT_FOUND, "Driver not found");
  }

  return prisma.driver.update({ where: { id }, data: payload });
};

export const driverService = {
  createDriver,
  getAllDrivers,
  getSingleDriver,
  updateDriver,
};
