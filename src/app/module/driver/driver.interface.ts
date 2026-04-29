import { DriverStatus } from "../../../generated/prisma/enums";

export interface ICreateDriver {
  userId: string;
  licenseNo: string;
  licenseImage?: string;
  yearsOfExperience?: number;
  location?: string;
}

export interface IUpdateDriver {
  licenseNo?: string;
  licenseImage?: string;
  yearsOfExperience?: number;
  isAvailable?: boolean;
  location?: string;
  status?: DriverStatus;
}
