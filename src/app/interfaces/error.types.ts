export interface TErrorSoures {
  path: string;
  message: string;
}

export interface TGenaricErrorResponse {
  statusCode: number;
  message: string;
  errorSources?: TErrorSoures[];
}
