import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { ICreateFuelType, IUpdateFuelType } from "./fuel-type.interface";

const getAllFuelTypes = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    searchFields: ["name"],
    sortableFields: ["name"],
    defaultSortBy: "name",
    defaultSortOrder: "asc",
  });

  const [fuelTypes, total] = await Promise.all([
    prisma.fuelType.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { _count: { select: { cars: true } } },
    }),
    prisma.fuelType.count({ where }),
  ]);

  return { data: fuelTypes, meta: buildMeta(total, page, limit) };
};

const getSingleFuelType = async (id: string) => {
  const fuelType = await prisma.fuelType.findUnique({
    where: { id },
    include: { _count: { select: { cars: true } } },
  });

  if (!fuelType) {
    throw new AppError(status.NOT_FOUND, "Fuel type not found");
  }

  return fuelType;
};

const createFuelType = async (payload: ICreateFuelType) => {
  const name = payload.name.trim();
  const existing = await prisma.fuelType.findUnique({ where: { name } });

  if (existing) {
    throw new AppError(status.CONFLICT, "Fuel type already exists");
  }

  return prisma.fuelType.create({
    data: { name, image: payload.image ?? null },
  });
};

const updateFuelType = async (id: string, payload: IUpdateFuelType) => {
  const existing = await prisma.fuelType.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Fuel type not found");
  }

  if (payload.name && payload.name !== existing.name) {
    const duplicate = await prisma.fuelType.findUnique({
      where: { name: payload.name.trim() },
    });
    if (duplicate) {
      throw new AppError(status.CONFLICT, "Fuel type already exists");
    }
  }

  return prisma.fuelType.update({
    where: { id },
    data: {
      ...payload,
      ...(payload.name ? { name: payload.name.trim() } : {}),
    },
  });
};

const deleteFuelType = async (id: string) => {
  const fuelType = await prisma.fuelType.findUnique({
    where: { id },
    include: { _count: { select: { cars: true } } },
  });

  if (!fuelType) {
    throw new AppError(status.NOT_FOUND, "Fuel type not found");
  }

  if (fuelType._count.cars > 0) {
    throw new AppError(
      status.CONFLICT,
      "Cannot delete fuel type with related cars",
    );
  }

  await prisma.fuelType.delete({ where: { id } });
};

export const fuelTypeService = {
  getAllFuelTypes,
  getSingleFuelType,
  createFuelType,
  updateFuelType,
  deleteFuelType,
};
