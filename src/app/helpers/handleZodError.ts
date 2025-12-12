/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSoures, TGenaricErrorResponse } from "../interfaces/error.types";

export const handleZodError = (err: any): TGenaricErrorResponse => {
  const errorSources: TErrorSoures[] = [];

  err.issues.forEach((issue: any) =>
    errorSources.push({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    })
  );

  return {
    statusCode: 400,
    message: "Zod Error",
    errorSources,
  };
};
