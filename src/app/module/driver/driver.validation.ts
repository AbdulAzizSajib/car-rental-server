import { z } from "zod";

const createDriverSchema = z.object({
  userId: z.uuid(),
  licenseNo: z.string().min(1),
});

const updateDriverSchema = z.object({
  licenseNo: z.string().min(1).optional(),
  isAvailable: z.boolean().optional(),
});

export const driverValidation = { createDriverSchema, updateDriverSchema };
