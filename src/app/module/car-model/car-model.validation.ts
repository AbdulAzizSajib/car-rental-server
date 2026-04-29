import { z } from "zod";

const createCarModelSchema = z.object({
  name: z.string().min(1),
  brandId: z.string().min(1),
});

const updateCarModelSchema = z.object({
  name: z.string().min(1).optional(),
  brandId: z.string().min(1).optional(),
});

export const carModelValidation = {
  createCarModelSchema,
  updateCarModelSchema,
};
