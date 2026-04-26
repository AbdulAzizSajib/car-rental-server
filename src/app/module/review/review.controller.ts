import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewService.createReview(req.user!.userId, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Review added successfully",
    data: result,
  });
});

const getCarReviews = catchAsync(async (req: Request, res: Response) => {
  const { carId } = req.query as { carId: string };
  const result = await reviewService.getCarReviews(
    carId,
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reviews fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await reviewService.deleteReview(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
});

export const reviewController = { createReview, getCarReviews, deleteReview };
