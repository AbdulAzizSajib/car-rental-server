import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { BookingStatus } from "../../../generated/prisma/enums";
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
    filterableFields: ["brand", "fuelType", "transmission", "isAvailable", "seats"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { images: true },
    }),
    prisma.car.count({ where }),
  ]);

  return { data: cars, meta: buildMeta(total, page, limit) };
};

const createCarProfile = async (payload: ICreateCar) => {
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
    },
  });

  return car;
};

const updateCar = async (id: string, payload: IUpdateCar) => {
  const car = await prisma.car.findUnique({ where: { id } });

  if (!car) {
    throw new AppError(status.NOT_FOUND, "Car not found");
  }

  const updated = await prisma.car.update({
    where: { id },
    data: payload,
  });

  return updated;
};

const deleteCar = async (id: string) => {
  const car = await prisma.car.findUnique({ where: { id } });

  if (!car) {
    throw new AppError(status.NOT_FOUND, "Car not found");
  }

  const activeBooking = await prisma.booking.findFirst({
    where: {
      carId: id,
      status: {
        in: [
          BookingStatus.PENDING,
          BookingStatus.CONFIRMED,
          BookingStatus.ONGOING,
        ],
      },
    },
  });

  if (activeBooking) {
    throw new AppError(
      status.CONFLICT,
      "Cannot delete car with active bookings",
    );
  }

  await prisma.car.delete({ where: { id } });
};

const uploadCarImages = async (id: string, files: Express.Multer.File[]) => {
  const car = await prisma.car.findUnique({ where: { id } });

  if (!car) {
    throw new AppError(status.NOT_FOUND, "Car not found");
  }

  const uploaded = await Promise.all(
    files.map((file) =>
      uploadFileToCloudinary(file.buffer, file.originalname, {
        folder: "car-rental/cars",
      }),
    ),
  );

  const images = await prisma.carImage.createManyAndReturn({
    data: uploaded.map((result) => ({ url: result.secure_url, carId: id })),
  });

  return images;
};

const deleteCarImage = async (imageId: string) => {
  const image = await prisma.carImage.findUnique({ where: { id: imageId } });

  if (!image) {
    throw new AppError(status.NOT_FOUND, "Image not found");
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
