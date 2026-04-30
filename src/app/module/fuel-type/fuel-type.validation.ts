import { z } from "zod";

const createFuelTypeSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1).optional().nullable(),
});

const updateFuelTypeSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().min(1).optional().nullable(),
});

export const fuelTypeValidation = { createFuelTypeSchema, updateFuelTypeSchema };
