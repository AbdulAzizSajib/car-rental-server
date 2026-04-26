import { DiscountType } from "../../../generated/prisma/enums";

export interface ICreateCoupon {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minAmount?: number;
  maxUses?: number;
  expiresAt?: Date;
}

export interface IApplyCoupon {
  code: string;
  bookingAmount: number;
}
