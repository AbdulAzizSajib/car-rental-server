import { BodyType, FuelType, TransmissionType } from "../../../generated/prisma/enums";

export interface ICreateCar {
  name: string;
  brand: string;
  model: string;
  year: number;
  bodyType: BodyType;
  pricePerDay: number;
  seats: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  mileage?: number | null;
  engineCapacity?: number | null;
  color?: string | null;
  registrationNo?: string | null;
  location: string;
  isAC?: boolean;
  isWithDriver?: boolean;
  isAvailable?: boolean;
}

export interface IUpdateCar {
  name?: string;
  brand?: string;
  model?: string;
  year?: number;
  bodyType?: BodyType;
  pricePerDay?: number;
  seats?: number;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  mileage?: number | null;
  engineCapacity?: number | null;
  color?: string | null;
  registrationNo?: string | null;
  location?: string;
  isAC?: boolean;
  isWithDriver?: boolean;
  isAvailable?: boolean;
}
