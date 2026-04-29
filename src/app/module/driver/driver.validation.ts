import { z } from "zod";
import { DriverStatus } from "../../../generated/prisma/enums";

const createDriverSchema = z.object({
  userId: z.uuid(),
  licenseNo: z.string().min(1),
  licenseImage: z.string().url().optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  location: z.string().min(1).optional(),
});

const updateDriverSchema = z.object({
  licenseNo: z.string().min(1).optional(),
  licenseImage: z.string().url().optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
  location: z.string().min(1).optional(),
  status: z.nativeEnum(DriverStatus).optional(),
});

export const driverValidation = { createDriverSchema, updateDriverSchema };
