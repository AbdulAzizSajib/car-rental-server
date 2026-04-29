import { PaymentMethod, PaymentStatus } from "../../../generated/prisma/enums";

export interface ICreatePayment {
  bookingId: string;
  method: PaymentMethod;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
}

export interface IUpdatePaymentStatus {
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
}
