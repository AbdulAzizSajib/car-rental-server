import { z } from "zod";
import { DiscountType } from "../../../generated/prisma/enums";

const createCouponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discountType: z.enum(Object.values(DiscountType) as [string, ...string[]]),
  discountValue: z.number().positive(),
  minAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.coerce.date().optional(),
});

const applyCouponSchema = z.object({
  code: z.string().min(1),
  bookingAmount: z.number().positive(),
});

export const couponValidation = { createCouponSchema, applyCouponSchema };
