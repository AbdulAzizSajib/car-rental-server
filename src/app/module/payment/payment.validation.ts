import { z } from "zod";
import { PaymentStatus } from "../../../generated/prisma/enums";

const createPaymentSchema = z.object({
  bookingId: z.uuid(),
  method: z.string().min(1),
  transactionId: z.string().optional(),
});

const updatePaymentStatusSchema = z.object({
  status: z.enum(Object.values(PaymentStatus) as [string, ...string[]]),
  transactionId: z.string().optional(),
});

export const paymentValidation = {
  createPaymentSchema,
  updatePaymentStatusSchema,
};
