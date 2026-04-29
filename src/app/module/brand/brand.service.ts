import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { ICreateBrand, IUpdateBrand } from "./brand.interface";

const getAllBrands = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    searchFields: ["name"],
    sortableFields: ["name"],
    defaultSortBy: "name",
    defaultSortOrder: "asc",
  });

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        _count: {
          select: { cars: true, models: true },
        },
      },
    }),
    prisma.brand.count({ where }),
  ]);

  return { data: brands, meta: buildMeta(total, page, limit) };
};

const getSingleBrand = async (id: string) => {
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      models: true,
      _count: {
        select: { cars: true, models: true },
      },
    },
  });

  if (!brand) {
    throw new AppError(status.NOT_FOUND, "Brand not found");
  }

  return brand;
};

const createBrand = async (payload: ICreateBrand) => {
  const name = payload.name.trim();
  const existing = await prisma.brand.findUnique({ where: { name } });

  if (existing) {
    throw new AppError(status.CONFLICT, "Brand already exists");
  }

  return prisma.brand.create({
    data: {
      name,
      logo: payload.logo ?? null,
    },
  });
};

const updateBrand = async (id: string, payload: IUpdateBrand) => {
  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Brand not found");
  }

  if (payload.name && payload.name !== existing.name) {
    const duplicate = await prisma.brand.findUnique({
      where: { name: payload.name.trim() },
    });
    if (duplicate) {
      throw new AppError(status.CONFLICT, "Brand already exists");
    }
  }

  return prisma.brand.update({
    where: { id },
    data: {
      ...payload,
      ...(payload.name ? { name: payload.name.trim() } : {}),
    },
  });
};

const deleteBrand = async (id: string) => {
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      _count: {
        select: { cars: true, models: true },
      },
    },
  });

  if (!brand) {
    throw new AppError(status.NOT_FOUND, "Brand not found");
  }

  if (brand._count.cars > 0 || brand._count.models > 0) {
    throw new AppError(
      status.CONFLICT,
      "Cannot delete brand with related cars or models",
    );
  }

  await prisma.brand.delete({ where: { id } });
};

export const brandService = {
  getAllBrands,
  getSingleBrand,
  createBrand,
  updateBrand,
  deleteBrand,
};
