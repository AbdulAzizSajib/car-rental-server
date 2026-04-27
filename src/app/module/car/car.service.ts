import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { BookingStatus, UserRole } from "../../../generated/prisma/enums";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../config/cloudinary.config";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { ICreateCar, IUpdateCar } from "./car.interface";

const getAllCars = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    searchFields: ["name", "brand", "model"],
    sortableFields: ["pricePerDay", "year", "createdAt"],
    filterableFields: ["brand", "fuelType", "transmission", "isAvailable", "seats", "hostId"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        images: true,
        host: { select: { id: true, isVerified: true, user: { select: { name: true } } } },
      },
    }),
    prisma.car.count({ where }),
  ]);

  return { data: cars, meta: buildMeta(total, page, limit) };
};

const resolveHostId = async (userId: string): Promise<string> => {
  const hostProfile = await prisma.hostProfile.findUnique({ where: { userId } });
  if (!hostProfile) {
    throw new AppError(status.BAD_REQUEST, "Host profile not found");
  }
  return hostProfile.id;
};

const assertCarOwnership = async (carId: string, userId: string) => {
  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: { host: true },
  });

  if (!car) {
    throw new AppError(status.NOT_FOUND, "Car not found");
  }

  if (!car.host || car.host.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You do not have permission to manage this car");
  }

  return car;
};

const createCarProfile = async (
  userId: string,
  role: UserRole,
  payload: ICreateCar,
) => {
  const carExists = await prisma.car.findFirst({
    where: {
      name: payload.name,
      brand: payload.brand,
      model: payload.model,
      year: payload.year,
    },
  });

  if (carExists) {
    throw new AppError(
      status.CONFLICT,
      "Car with this name, brand, model & year already exists",
    );
  }

  let hostId: string | null = null;
  if (role === UserRole.HOST) {
    hostId = await resolveHostId(userId);
  }

  const car = await prisma.car.create({
    data: {
      name: payload.name,
      brand: payload.brand,
      model: payload.model,
      year: payload.year,
      pricePerDay: payload.pricePerDay,
      seats: payload.seats,
      transmission: payload.transmission,
      fuelType: payload.fuelType,
      mileage: payload.mileage ?? null,
      isAvailable: payload.isAvailable ?? true,
      hostId,
    },
  });

  return car;
};

const updateCar = async (
  id: string,
  userId: string,
  role: UserRole,
  payload: IUpdateCar,
) => {
  if (role === UserRole.HOST) {
    await assertCarOwnership(id, userId);
  } else {
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) throw new AppError(status.NOT_FOUND, "Car not found");
  }

  return prisma.car.update({ where: { id }, data: payload });
};

const deleteCar = async (id: string, userId: string, role: UserRole) => {
  if (role === UserRole.HOST) {
    await assertCarOwnership(id, userId);
  } else {
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) throw new AppError(status.NOT_FOUND, "Car not found");
  }

  const activeBooking = await prisma.booking.findFirst({
    where: {
      carId: id,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.ONGOING],
      },
    },
  });

  if (activeBooking) {
    throw new AppError(status.CONFLICT, "Cannot delete car with active bookings");
  }

  await prisma.car.delete({ where: { id } });
};

const uploadCarImages = async (
  id: string,
  userId: string,
  role: UserRole,
  files: Express.Multer.File[],
) => {
  if (role === UserRole.HOST) {
    await assertCarOwnership(id, userId);
  } else {
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) throw new AppError(status.NOT_FOUND, "Car not found");
  }

  const uploaded = await Promise.all(
    files.map((file) =>
      uploadFileToCloudinary(file.buffer, file.originalname, {
        folder: "car-rental/cars",
      }),
    ),
  );

  return prisma.carImage.createManyAndReturn({
    data: uploaded.map((result) => ({ url: result.secure_url, carId: id })),
  });
};

const deleteCarImage = async (
  imageId: string,
  userId: string,
  role: UserRole,
) => {
  const image = await prisma.carImage.findUnique({
    where: { id: imageId },
    include: { car: { include: { host: true } } },
  });

  if (!image) {
    throw new AppError(status.NOT_FOUND, "Image not found");
  }

  if (role === UserRole.HOST) {
    if (!image.car.host || image.car.host.userId !== userId) {
      throw new AppError(status.FORBIDDEN, "You do not have permission to delete this image");
    }
  }

  await deleteFileFromCloudinary(image.url);
  await prisma.carImage.delete({ where: { id: imageId } });
};

export const carService = {
  getAllCars,
  createCarProfile,
  updateCar,
  deleteCar,
  uploadCarImages,
  deleteCarImage,
};
