import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { ICreateBodyType, IUpdateBodyType } from "./body-type.interface";

const getAllBodyTypes = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    searchFields: ["name"],
    sortableFields: ["name"],
    defaultSortBy: "name",
    defaultSortOrder: "asc",
  });

  const [bodyTypes, total] = await Promise.all([
    prisma.bodyType.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { _count: { select: { cars: true } } },
    }),
    prisma.bodyType.count({ where }),
  ]);

  return { data: bodyTypes, meta: buildMeta(total, page, limit) };
};

const getSingleBodyType = async (id: string) => {
  const bodyType = await prisma.bodyType.findUnique({
    where: { id },
    include: { _count: { select: { cars: true } } },
  });

  if (!bodyType) {
    throw new AppError(status.NOT_FOUND, "Body type not found");
  }

  return bodyType;
};

const createBodyType = async (payload: ICreateBodyType) => {
  const name = payload.name.trim();
  const existing = await prisma.bodyType.findUnique({ where: { name } });

  if (existing) {
    throw new AppError(status.CONFLICT, "Body type already exists");
  }

  return prisma.bodyType.create({
    data: { name, image: payload.image ?? null },
  });
};

const updateBodyType = async (id: string, payload: IUpdateBodyType) => {
  const existing = await prisma.bodyType.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Body type not found");
  }

  if (payload.name && payload.name !== existing.name) {
    const duplicate = await prisma.bodyType.findUnique({
      where: { name: payload.name.trim() },
    });
    if (duplicate) {
      throw new AppError(status.CONFLICT, "Body type already exists");
    }
  }

  return prisma.bodyType.update({
    where: { id },
    data: {
      ...payload,
      ...(payload.name ? { name: payload.name.trim() } : {}),
    },
  });
};

const deleteBodyType = async (id: string) => {
  const bodyType = await prisma.bodyType.findUnique({
    where: { id },
    include: { _count: { select: { cars: true } } },
  });

  if (!bodyType) {
    throw new AppError(status.NOT_FOUND, "Body type not found");
  }

  if (bodyType._count.cars > 0) {
    throw new AppError(
      status.CONFLICT,
      "Cannot delete body type with related cars",
    );
  }

  await prisma.bodyType.delete({ where: { id } });
};

export const bodyTypeService = {
  getAllBodyTypes,
  getSingleBodyType,
  createBodyType,
  updateBodyType,
  deleteBodyType,
};
