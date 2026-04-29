import { BookingStatus } from "../../../generated/prisma/enums";

export interface ICreateBooking {
  carId: string;
  driverId?: string;
  pickupLocation: string;
  dropLocation: string;
  startDate: Date;
  endDate: Date;
  tripType?: string;
  contactNumber?: string;
  specialRequest?: string;
}

export interface IUpdateBookingStatus {
  status: BookingStatus;
}

export interface IAssignDriver {
  driverId: string;
}
