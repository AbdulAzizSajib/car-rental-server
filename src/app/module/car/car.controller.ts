import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { carService } from "./car.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getAllCars = catchAsync(async (req: Request, res: Response) => {
  const result = await carService.getAllCars(req.query as Record<string, unknown>);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Cars fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const createCarProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await carService.createCarProfile(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Car profile created successfully",
    data: result,
  });
});

const updateCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await carService.updateCar(id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Car updated successfully",
    data: result,
  });
});

const deleteCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await carService.deleteCar(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Car deleted successfully",
    data: null,
  });
});

const uploadCarImages = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const files = req.files as Express.Multer.File[];

  const result = await carService.uploadCarImages(id, files);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Car images uploaded successfully",
    data: result,
  });
});

const deleteCarImage = catchAsync(async (req: Request, res: Response) => {
  const { imageId } = req.params as { imageId: string };
  await carService.deleteCarImage(imageId);

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
  deleteCarImage,
};
