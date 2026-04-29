export interface ICreateBrand {
  name: string;
  logo?: string | null;
}

export interface IUpdateBrand {
  name?: string;
  logo?: string | null;
}
