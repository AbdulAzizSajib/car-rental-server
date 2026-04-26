import { z } from "zod";
import { BookingStatus } from "../../../generated/prisma/enums";

const createBookingSchema = z.object({
  carId: z.uuid(),
  driverId: z.uuid().optional(),
  pickupLocation: z.string().min(1),
  dropLocation: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

const updateStatusSchema = z.object({
  status: z.enum(Object.values(BookingStatus) as [string, ...string[]]),
});

const assignDriverSchema = z.object({
  driverId: z.uuid(),
});

export const bookingValidation = {
  createBookingSchema,
  updateStatusSchema,
  assignDriverSchema,
};
