export interface ICreateDriver {
  userId: string;
  licenseNo: string;
}

export interface IUpdateDriver {
  licenseNo?: string;
  isAvailable?: boolean;
}
