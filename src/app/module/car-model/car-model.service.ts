import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { ICreateCarModel, IUpdateCarModel } from "./car-model.interface";

const getAllCarModels = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    searchFields: ["name"],
    filterableFields: ["brandId"],
    sortableFields: ["name"],
    defaultSortBy: "name",
    defaultSortOrder: "asc",
  });

  const [models, total] = await Promise.all([
    prisma.carModel.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        brand: true,
        _count: { select: { cars: true } },
      },
    }),
    prisma.carModel.count({ where }),
  ]);

  return { data: models, meta: buildMeta(total, page, limit) };
};

const getSingleCarModel = async (id: string) => {
  const carModel = await prisma.carModel.findUnique({
    where: { id },
    include: {
      brand: true,
      _count: { select: { cars: true } },
    },
  });

  if (!carModel) {
    throw new AppError(status.NOT_FOUND, "Car model not found");
  }

  return carModel;
};

const createCarModel = async (payload: ICreateCarModel) => {
  const brand = await prisma.brand.findUnique({
    where: { id: payload.brandId },
  });
  if (!brand) {
    throw new AppError(status.NOT_FOUND, "Brand not found");
  }

  return prisma.carModel.create({
    data: {
      name: payload.name.trim(),
      brandId: payload.brandId,
    },
  });
};

const updateCarModel = async (id: string, payload: IUpdateCarModel) => {
  const existing = await prisma.carModel.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Car model not found");
  }

  if (payload.brandId) {
    const brand = await prisma.brand.findUnique({
      where: { id: payload.brandId },
    });
    if (!brand) {
      throw new AppError(status.NOT_FOUND, "Brand not found");
    }
  }

  return prisma.carModel.update({
    where: { id },
    data: {
      ...payload,
      ...(payload.name ? { name: payload.name.trim() } : {}),
    },
  });
};

const deleteCarModel = async (id: string) => {
  const carModel = await prisma.carModel.findUnique({
    where: { id },
    include: { _count: { select: { cars: true } } },
  });

  if (!carModel) {
    throw new AppError(status.NOT_FOUND, "Car model not found");
  }

  if (carModel._count.cars > 0) {
    throw new AppError(
      status.CONFLICT,
      "Cannot delete car model with related cars",
    );
  }

  await prisma.carModel.delete({ where: { id } });
};

export const carModelService = {
  getAllCarModels,
  getSingleCarModel,
  createCarModel,
  updateCarModel,
  deleteCarModel,
};
