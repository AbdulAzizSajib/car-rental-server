import { z } from "zod";

const updateHostProfileSchema = z.object({
  bio: z.string().min(1).optional(),
});

export const hostValidation = { updateHostProfileSchema };
