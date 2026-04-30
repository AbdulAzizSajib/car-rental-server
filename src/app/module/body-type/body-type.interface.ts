export interface ICreateBodyType {
  name: string;
  image?: string | null;
}

export interface IUpdateBodyType {
  name?: string;
  image?: string | null;
}
