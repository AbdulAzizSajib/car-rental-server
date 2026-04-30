import { RentalType, TransmissionType } from "../../../generated/prisma/enums";

export interface ICreateCar {
  name: string;
  brandId: string;
  modelId: string;
  year: number;
  bodyTypeId: string;
  pricePerDay: number;
  rentalType?: RentalType;
  seats: number;
  transmission: TransmissionType;
  fuelTypeId: string;
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
  brandId?: string;
  modelId?: string;
  year?: number;
  bodyTypeId?: string;
  pricePerDay?: number;
  rentalType?: RentalType;
  seats?: number;
  transmission?: TransmissionType;
  fuelTypeId?: string;
  mileage?: number | null;
  engineCapacity?: number | null;
  color?: string | null;
  registrationNo?: string | null;
  location?: string;
  isAC?: boolean;
  isWithDriver?: boolean;
  isAvailable?: boolean;
}
