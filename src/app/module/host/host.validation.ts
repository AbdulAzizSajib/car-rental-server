import { z } from "zod";

const updateHostProfileSchema = z.object({
  bio: z.string().min(1).optional(),
  nidNumber: z.string().min(1).optional(),
  nidFrontImage: z.string().url().optional(),
  nidBackImage: z.string().url().optional(),
  address: z.string().min(1).optional(),
  emergencyContact: z.string().min(1).optional(),
});

export const hostValidation = { updateHostProfileSchema };
