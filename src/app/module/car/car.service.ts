import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import {
  BookingStatus,
  RentalType,
  UserRole,
} from "../../../generated/prisma/enums";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../config/cloudinary.config";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { ICreateCar, IUpdateCar } from "./car.interface";

const getAllCars = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    searchFields: [],
    sortableFields: ["pricePerDay", "year", "createdAt"],
    filterableFields: [
      "brandId",
      "modelId",
      "fuelTypeId",
      "transmission",
      "bodyTypeId",
      "rentalType",
      "isAvailable",
      "isAC",
      "isWithDriver",
      "seats",
      "location",
      "hostId",
    ],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const andConditions = Array.isArray(where.AND) ? [...where.AND] : [];

  const searchTerm =
    typeof query.search === "string" ? query.search.trim() : "";
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { brand: { name: { contains: searchTerm, mode: "insensitive" } } },
        { model: { name: { contains: searchTerm, mode: "insensitive" } } },
      ],
    });
  }

  const priceFrom = query.priceFrom;
  if (priceFrom !== undefined && priceFrom !== null && priceFrom !== "") {
    const fromValue = Number(priceFrom);
    if (!Number.isNaN(fromValue)) {
      andConditions.push({ pricePerDay: { gte: fromValue } });
    }
  }

  const priceTo = query.priceTo;
  if (priceTo !== undefined && priceTo !== null && priceTo !== "") {
    const toValue = Number(priceTo);
    if (!Number.isNaN(toValue)) {
      andConditions.push({ pricePerDay: { lte: toValue } });
    }
  }

  const whereClause = andConditions.length > 0 ? { AND: andConditions } : where;

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where: whereClause,
      orderBy,
      skip,
      take,
      include: {
        brand: true,
        model: true,
        bodyType: true,
        fuelType: true,
        images: true,
        host: {
          select: {
            id: true,
            isVerified: true,
            user: { select: { name: true } },
          },
        },
      },
    }),
    prisma.car.count({ where: whereClause }),
  ]);

  return { data: cars, meta: buildMeta(total, page, limit) };
};

const resolveHostId = async (userId: string): Promise<string> => {
  const hostProfile = await prisma.hostProfile.findUnique({
    where: { userId },
  });
  if (!hostProfile) {
    throw new AppError(status.BAD_REQUEST, "Host profile not found");
  }
  return hostProfile.id;
};

const validateBrandAndModel = async (brandId: string, modelId: string) => {
  const [brand, model] = await Promise.all([
    prisma.brand.findUnique({ where: { id: brandId } }),
    prisma.carModel.findUnique({ where: { id: modelId } }),
  ]);

  if (!brand) {
    throw new AppError(status.NOT_FOUND, "Brand not found");
  }

  if (!model) {
    throw new AppError(status.NOT_FOUND, "Car model not found");
  }

  if (model.brandId !== brandId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Selected car model does not belong to the selected brand",
    );
  }

  return { brand, model };
};

const validateBodyAndFuelType = async (
  bodyTypeId: string,
  fuelTypeId: string,
) => {
  const [bodyType, fuelType] = await Promise.all([
    prisma.bodyType.findUnique({ where: { id: bodyTypeId } }),
    prisma.fuelType.findUnique({ where: { id: fuelTypeId } }),
  ]);

  if (!bodyType) {
    throw new AppError(status.NOT_FOUND, "Body type not found");
  }

  if (!fuelType) {
    throw new AppError(status.NOT_FOUND, "Fuel type not found");
  }

  return { bodyType, fuelType };
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
    throw new AppError(
      status.FORBIDDEN,
      "You do not have permission to manage this car",
    );
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
      brandId: payload.brandId,
      modelId: payload.modelId,
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

  await validateBrandAndModel(payload.brandId, payload.modelId);
  await validateBodyAndFuelType(payload.bodyTypeId, payload.fuelTypeId);

  const car = await prisma.car.create({
    data: {
      name: payload.name,
      brandId: payload.brandId,
      modelId: payload.modelId,
      year: payload.year,
      bodyTypeId: payload.bodyTypeId,
      pricePerDay: payload.pricePerDay,
      seats: payload.seats,
      transmission: payload.transmission,
      fuelTypeId: payload.fuelTypeId,
      mileage: payload.mileage ?? null,
      engineCapacity: payload.engineCapacity ?? null,
      color: payload.color ?? null,
      registrationNo: payload.registrationNo ?? null,
      location: payload.location,
      rentalType: payload.rentalType ?? RentalType.ANY,
      isAC: payload.isAC ?? true,
      isWithDriver: payload.isWithDriver ?? false,
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

  const currentCar = await prisma.car.findUnique({ where: { id } });
  if (!currentCar) {
    throw new AppError(status.NOT_FOUND, "Car not found");
  }

  const nextBrandId = payload.brandId ?? currentCar.brandId;
  const nextModelId = payload.modelId ?? currentCar.modelId;

  if (payload.brandId || payload.modelId) {
    await validateBrandAndModel(nextBrandId, nextModelId);
  }

  if (payload.bodyTypeId || payload.fuelTypeId) {
    await validateBodyAndFuelType(
      payload.bodyTypeId ?? currentCar.bodyTypeId,
      payload.fuelTypeId ?? currentCar.fuelTypeId,
    );
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

  const existingCount = await prisma.carImage.count({ where: { carId: id } });

  const uploaded = await Promise.all(
    files.map((file) =>
      uploadFileToCloudinary(file.buffer, file.originalname, {
        folder: "car-rental/cars",
      }),
    ),
  );

  return prisma.carImage.createManyAndReturn({
    data: uploaded.map((result, index) => ({
      url: result.secure_url,
      carId: id,
      isPrimary: existingCount === 0 && index === 0,
    })),
  });
};

const setPrimaryImage = async (
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
      throw new AppError(
        status.FORBIDDEN,
        "You do not have permission to manage this car",
      );
    }
  }

  await prisma.$transaction([
    prisma.carImage.updateMany({
      where: { carId: image.carId, isPrimary: true },
      data: { isPrimary: false },
    }),
    prisma.carImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    }),
  ]);

  return prisma.carImage.findUnique({ where: { id: imageId } });
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
      throw new AppError(
        status.FORBIDDEN,
        "You do not have permission to delete this image",
      );
    }
  }

  await deleteFileFromCloudinary(image.url);
  await prisma.carImage.delete({ where: { id: imageId } });

  if (image.isPrimary) {
    const next = await prisma.carImage.findFirst({
      where: { carId: image.carId },
    });
    if (next) {
      await prisma.carImage.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }
};

const getCarById = async (id: string) => {
  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      brand: true,
      model: true,
      bodyType: true,
      fuelType: true,
      images: true,
      host: {
        select: {
          id: true,
          isVerified: true,
          user: { select: { name: true, image: true } },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  if (!car) {
    throw new AppError(status.NOT_FOUND, "Car not found");
  }

  return car;
};

export const carService = {
  getAllCars,
  getCarById,
  createCarProfile,
  updateCar,
  deleteCar,
  uploadCarImages,
  setPrimaryImage,
  deleteCarImage,
};
