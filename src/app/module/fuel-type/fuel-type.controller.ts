import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { fuelTypeService } from "./fuel-type.service";

const getAllFuelTypes = catchAsync(async (req: Request, res: Response) => {
  const result = await fuelTypeService.getAllFuelTypes(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Fuel types fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleFuelType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await fuelTypeService.getSingleFuelType(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Fuel type fetched successfully",
    data: result,
  });
});

const createFuelType = catchAsync(async (req: Request, res: Response) => {
  const result = await fuelTypeService.createFuelType(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Fuel type created successfully",
    data: result,
  });
});

const updateFuelType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await fuelTypeService.updateFuelType(id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Fuel type updated successfully",
    data: result,
  });
});

const deleteFuelType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await fuelTypeService.deleteFuelType(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Fuel type deleted successfully",
    data: null,
  });
});

export const fuelTypeController = {
  getAllFuelTypes,
  getSingleFuelType,
  createFuelType,
  updateFuelType,
  deleteFuelType,
};
