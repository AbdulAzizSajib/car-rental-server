import {
  BodyType,
  FuelType,
  RentalType,
  TransmissionType,
} from "../../../generated/prisma/enums";

export interface ICreateCar {
  name: string;
  brandId: string;
  modelId: string;
  year: number;
  bodyType: BodyType;
  pricePerDay: number;
  rentalType?: RentalType;
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
  brandId?: string;
  modelId?: string;
  year?: number;
  bodyType?: BodyType;
  pricePerDay?: number;
  rentalType?: RentalType;
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
