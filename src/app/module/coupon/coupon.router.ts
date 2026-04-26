import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { couponController } from "./coupon.controller";
import { couponValidation } from "./coupon.validation";

const couponRouter = Router();

couponRouter.post(
  "/apply",
  checkAuth(UserRole.USER),
  validateRequest(couponValidation.applyCouponSchema),
  couponController.applyCoupon,
);

couponRouter.get(
  "/",
  checkAuth(UserRole.ADMIN),
  couponController.getAllCoupons,
);

couponRouter.post(
  "/",
  checkAuth(UserRole.ADMIN),
  validateRequest(couponValidation.createCouponSchema),
  couponController.createCoupon,
);

export default couponRouter;
