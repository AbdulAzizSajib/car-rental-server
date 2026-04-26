import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { couponService } from "./coupon.service";

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await couponService.createCoupon(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Coupon created successfully",
    data: result,
  });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await couponService.getAllCoupons(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Coupons fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await couponService.applyCoupon(req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Coupon applied successfully",
    data: result,
  });
});

export const couponController = { createCoupon, getAllCoupons, applyCoupon };
