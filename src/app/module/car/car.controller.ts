import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { carService } from "./car.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";

const getAllCars = catchAsync(async (req: Request, res: Response) => {
  const result = await carService.getAllCars(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Cars fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const createCarProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const result = await carService.createCarProfile(
    req.user.userId,
    req.user.role,
    req.body,
  );

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Car profile created successfully",
    data: result,
  });
});

const updateCar = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const { id } = req.params as { id: string };
  const result = await carService.updateCar(
    id,
    req.user.userId,
    req.user.role,
    req.body,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Car updated successfully",
    data: result,
  });
});

const deleteCar = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const { id } = req.params as { id: string };
  await carService.deleteCar(id, req.user.userId, req.user.role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Car deleted successfully",
    data: null,
  });
});

const uploadCarImages = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const { id } = req.params as { id: string };
  const files = req.files as Express.Multer.File[];

  const result = await carService.uploadCarImages(
    id,
    req.user.userId,
    req.user.role,
    files,
  );

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Car images uploaded successfully",
    data: result,
  });
});

const setPrimaryImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const { imageId } = req.params as { imageId: string };
  const result = await carService.setPrimaryImage(imageId, req.user.userId, req.user.role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Primary image updated successfully",
    data: result,
  });
});

const deleteCarImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const { imageId } = req.params as { imageId: string };
  await carService.deleteCarImage(imageId, req.user.userId, req.user.role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Car image deleted successfully",
    data: null,
  });
});

export const carController = {
  getAllCars,
  createCarProfile,
  updateCar,
  deleteCar,
  uploadCarImages,
  setPrimaryImage,
  deleteCarImage,
};
