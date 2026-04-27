import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { hostService } from "./host.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";

const becomeHost = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const result = await hostService.becomeHost(req.user.userId);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "You are now a host",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const result = await hostService.getMyProfile(req.user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Host profile fetched successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const result = await hostService.updateMyProfile(req.user.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Host profile updated successfully",
    data: result,
  });
});

const getMyCars = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const result = await hostService.getMyCars(
    req.user.userId,
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

const getMyCarBookings = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const result = await hostService.getMyCarBookings(
    req.user.userId,
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Bookings fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getDashboard = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const result = await hostService.getDashboard(req.user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Host dashboard fetched successfully",
    data: result,
  });
});

const getAllHosts = catchAsync(async (req: Request, res: Response) => {
  const result = await hostService.getAllHosts(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Hosts fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const verifyHost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await hostService.verifyHost(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Host verified successfully",
    data: result,
  });
});

export const hostController = {
  becomeHost,
  getMyProfile,
  updateMyProfile,
  getMyCars,
  getMyCarBookings,
  getDashboard,
  getAllHosts,
  verifyHost,
};
