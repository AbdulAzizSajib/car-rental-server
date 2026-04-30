import { z } from "zod";

const createBodyTypeSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1).optional().nullable(),
});

const updateBodyTypeSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().min(1).optional().nullable(),
});

export const bodyTypeValidation = { createBodyTypeSchema, updateBodyTypeSchema };
