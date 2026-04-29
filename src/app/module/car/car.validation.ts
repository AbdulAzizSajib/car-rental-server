import { z } from "zod";
import { BodyType, FuelType, TransmissionType } from "../../../generated/prisma/enums";

const createCarSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1886),
  bodyType: z.enum(Object.values(BodyType) as [string, ...string[]]),
  pricePerDay: z.number().positive(),
  seats: z.number().int().positive(),
  transmission: z.enum(Object.values(TransmissionType) as [string, ...string[]]),
  fuelType: z.enum(Object.values(FuelType) as [string, ...string[]]),
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
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1886).optional(),
  bodyType: z.enum(Object.values(BodyType) as [string, ...string[]]).optional(),
  pricePerDay: z.number().positive().optional(),
  seats: z.number().int().positive().optional(),
  transmission: z.enum(Object.values(TransmissionType) as [string, ...string[]]).optional(),
  fuelType: z.enum(Object.values(FuelType) as [string, ...string[]]).optional(),
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
