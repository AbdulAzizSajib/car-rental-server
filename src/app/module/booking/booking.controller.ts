import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { bookingService } from "./booking.service";
import { UserRole } from "../../../generated/prisma/enums";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await bookingService.createBooking(userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await bookingService.getMyBookings(
    userId,
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

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === UserRole.ADMIN;
  const result = await bookingService.getSingleBooking(id, userId, isAdmin);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking fetched successfully",
    data: result,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user!.userId;
  const result = await bookingService.cancelBooking(id, userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.getAllBookings(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All bookings fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await bookingService.updateBookingStatus(id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking status updated successfully",
    data: result,
  });
});

const assignDriver = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await bookingService.assignDriver(id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Driver assigned successfully",
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getMyBookings,
  getSingleBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  assignDriver,
};
