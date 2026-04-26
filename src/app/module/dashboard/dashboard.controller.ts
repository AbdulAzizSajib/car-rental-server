import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { dashboardService } from "./dashboard.service";

const getSummary = catchAsync(async (_req: Request, res: Response) => {
  const result = await dashboardService.getSummary();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Dashboard summary fetched successfully",
    data: result,
  });
});

const getRecentBookings = catchAsync(async (_req: Request, res: Response) => {
  const result = await dashboardService.getRecentBookings();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Recent bookings fetched successfully",
    data: result,
  });
});

const getBookingStatusCount = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await dashboardService.getBookingStatusCount();

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Booking status counts fetched successfully",
      data: result,
    });
  },
);

export const dashboardController = {
  getSummary,
  getRecentBookings,
  getBookingStatusCount,
};
