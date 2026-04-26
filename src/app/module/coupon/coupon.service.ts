import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { DiscountType } from "../../../generated/prisma/enums";
import { buildMeta, buildQuery } from "../../utils/queryBuilder";
import { IApplyCoupon, ICreateCoupon } from "./coupon.interface";

const createCoupon = async (payload: ICreateCoupon) => {
  const existing = await prisma.coupon.findUnique({
    where: { code: payload.code.toUpperCase() },
  });

  if (existing) {
    throw new AppError(status.CONFLICT, "Coupon code already exists");
  }

  if (payload.discountType === DiscountType.PERCENTAGE && payload.discountValue > 100) {
    throw new AppError(status.BAD_REQUEST, "Percentage discount cannot exceed 100");
  }

  return prisma.coupon.create({
    data: { ...payload, code: payload.code.toUpperCase() },
  });
};

const getAllCoupons = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildQuery(query, {
    filterableFields: ["isActive", "discountType"],
    sortableFields: ["createdAt", "discountValue"],
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({ where, orderBy, skip, take }),
    prisma.coupon.count({ where }),
  ]);

  return { data: coupons, meta: buildMeta(total, page, limit) };
};

const applyCoupon = async (payload: IApplyCoupon) => {
  const coupon = await prisma.coupon.findUnique({
    where: { code: payload.code.toUpperCase() },
  });

  if (!coupon) {
    throw new AppError(status.NOT_FOUND, "Coupon not found");
  }

  if (!coupon.isActive) {
    throw new AppError(status.BAD_REQUEST, "Coupon is inactive");
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new AppError(status.BAD_REQUEST, "Coupon has expired");
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new AppError(status.BAD_REQUEST, "Coupon usage limit reached");
  }

  if (coupon.minAmount !== null && payload.bookingAmount < coupon.minAmount) {
    throw new AppError(
      status.BAD_REQUEST,
      `Minimum booking amount for this coupon is ${coupon.minAmount}`,
    );
  }

  let discountAmount: number;

  if (coupon.discountType === DiscountType.PERCENTAGE) {
    discountAmount = (payload.bookingAmount * coupon.discountValue) / 100;
  } else {
    discountAmount = Math.min(coupon.discountValue, payload.bookingAmount);
  }

  const finalAmount = payload.bookingAmount - discountAmount;

  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100,
  };
};

export const couponService = { createCoupon, getAllCoupons, applyCoupon };
