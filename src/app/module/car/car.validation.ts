import { z } from "zod";
import {
  RentalType,
  TransmissionType,
} from "../../../generated/prisma/enums";

const createCarSchema = z.object({
  name: z.string().min(1),
  brandId: z.string().min(1),
  modelId: z.string().min(1),
  year: z.number().int().min(1886),
  bodyTypeId: z.string().min(1),
  pricePerDay: z.number().positive(),
  rentalType: z
    .enum(Object.values(RentalType) as [string, ...string[]])
    .default(RentalType.ANY),
  seats: z.number().int().positive(),
  transmission: z.enum(
    Object.values(TransmissionType) as [string, ...string[]],
  ),
  fuelTypeId: z.string().min(1),
  mileage: z.number().positive().optional(),
  engineCapacity: z.number().int().positive().optional(),
  color: z.string().min(1).optional(),
  registrationNo: z.string().min(1).optional(),
  location: z.string().min(1),
  isAC: z.boolean().default(true),
  isWithDriver: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
});

const updateCarSchema = z.object({
  name: z.string().min(1).optional(),
  brandId: z.string().min(1).optional(),
  modelId: z.string().min(1).optional(),
  year: z.number().int().min(1886).optional(),
  bodyTypeId: z.string().min(1).optional(),
  pricePerDay: z.number().positive().optional(),
  rentalType: z
    .enum(Object.values(RentalType) as [string, ...string[]])
    .optional(),
  seats: z.number().int().positive().optional(),
  transmission: z
    .enum(Object.values(TransmissionType) as [string, ...string[]])
    .optional(),
  fuelTypeId: z.string().min(1).optional(),
  mileage: z.number().positive().nullable().optional(),
  engineCapacity: z.number().int().positive().nullable().optional(),
  color: z.string().min(1).nullable().optional(),
  registrationNo: z.string().min(1).nullable().optional(),
  location: z.string().min(1).optional(),
  isAC: z.boolean().optional(),
  isWithDriver: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
});

export const carValidation = { createCarSchema, updateCarSchema };
