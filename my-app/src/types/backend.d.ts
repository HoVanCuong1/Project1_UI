export interface IBackendRes<T> {
  resultDesc: string;
  resultCode: number | string;
  data?: T;
}

export interface IRequestBody<T> {
  data?: T;
}

export interface IModelPaginate<T> {
  meta: {
    page: number; 
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}
