import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { carModelService } from "./car-model.service";

const getAllCarModels = catchAsync(async (req: Request, res: Response) => {
  const result = await carModelService.getAllCarModels(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Car models fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleCarModel = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await carModelService.getSingleCarModel(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Car model fetched successfully",
    data: result,
  });
});

const createCarModel = catchAsync(async (req: Request, res: Response) => {
  const result = await carModelService.createCarModel(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Car model created successfully",
    data: result,
  });
});

const updateCarModel = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await carModelService.updateCarModel(id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Car model updated successfully",
    data: result,
  });
});

const deleteCarModel = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await carModelService.deleteCarModel(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Car model deleted successfully",
    data: null,
  });
});

export const carModelController = {
  getAllCarModels,
  getSingleCarModel,
  createCarModel,
  updateCarModel,
  deleteCarModel,
};
