import { z } from "zod";

const createReviewSchema = z
  .object({
    carId: z.uuid().optional(),
    driverId: z.uuid().optional(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1).optional(),
  })
  .refine((data) => data.carId || data.driverId, {
    message: "Either carId or driverId must be provided",
  });

export const reviewValidation = { createReviewSchema };
