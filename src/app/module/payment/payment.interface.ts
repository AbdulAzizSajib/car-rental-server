import { PaymentStatus } from "../../../generated/prisma/enums";

export interface ICreatePayment {
  bookingId: string;
  method: string;
  transactionId?: string;
}

export interface IUpdatePaymentStatus {
  status: PaymentStatus;
  transactionId?: string;
}
