import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { driverService } from "./driver.service";

const createDriver = catchAsync(async (req: Request, res: Response) => {
  const result = await driverService.createDriver(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Driver profile created successfully",
    data: result,
  });
});

const getAllDrivers = catchAsync(async (req: Request, res: Response) => {
  const result = await driverService.getAllDrivers(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Drivers fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleDriver = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await driverService.getSingleDriver(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Driver fetched successfully",
    data: result,
  });
});

const updateDriver = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await driverService.updateDriver(id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Driver updated successfully",
    data: result,
  });
});

export const driverController = {
  createDriver,
  getAllDrivers,
  getSingleDriver,
  updateDriver,
};
