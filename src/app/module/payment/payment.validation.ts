import { z } from "zod";
import { PaymentMethod, PaymentStatus } from "../../../generated/prisma/enums";

const createPaymentSchema = z.object({
  bookingId: z.uuid(),
  method: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
  transactionId: z.string().optional(),
  gatewayResponse: z.record(z.string(), z.unknown()).optional(),
});

const updatePaymentStatusSchema = z.object({
  status: z.enum(Object.values(PaymentStatus) as [string, ...string[]]),
  transactionId: z.string().optional(),
  gatewayResponse: z.record(z.string(), z.unknown()).optional(),
});

export const paymentValidation = {
  createPaymentSchema,
  updatePaymentStatusSchema,
};
