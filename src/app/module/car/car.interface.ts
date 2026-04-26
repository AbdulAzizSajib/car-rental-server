import { FuelType, TransmissionType } from "../../../generated/prisma/enums";

export interface ICreateCar {
  name: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  seats: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  mileage?: number | null;
  isAvailable?: boolean;
}

export interface IUpdateCar {
  name?: string;
  brand?: string;
  model?: string;
  year?: number;
  pricePerDay?: number;
  seats?: number;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  mileage?: number | null;
  isAvailable?: boolean;
}
