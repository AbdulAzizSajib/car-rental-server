import { z } from "zod";

const createReviewSchema = z.object({
  carId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).optional(),
});

export const reviewValidation = { createReviewSchema };
