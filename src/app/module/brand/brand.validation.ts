import { z } from "zod";

const createBrandSchema = z.object({
  name: z.string().min(1),
  logo: z.string().min(1).optional().nullable(),
});

const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().min(1).optional().nullable(),
});

export const brandValidation = { createBrandSchema, updateBrandSchema };
