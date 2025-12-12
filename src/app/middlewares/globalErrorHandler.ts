/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError"
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handleZodError } from "../helpers/handleZodError";
import { handleValidationError } from "../helpers/handleValidtionError";
import { TErrorSoures } from "../interfaces/error.types";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

        // if (envVars.NODE_ENV === "development") {
        //   console.log(err);
        // }

    let errorSources: TErrorSoures[] = [];

    let statusCode = 500
    let message  =  `Something went wrong ! `


    // handle mongoose duplicate key error
if (err.code === 11000) {
  const simplifiedError = handleDuplicateError(err);
  statusCode = simplifiedError.statusCode;
  message = simplifiedError.message;
}

// Object ID error / Cast Error
else if (err.name === "CastError") {
     const simplifiedError = handleCastError(err);
  statusCode = simplifiedError.statusCode;
  message = simplifiedError.message;
}
  
    // Zod Validation Error
else if (err.name === "ZodError") { 

 const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    errorSources = simplifiedError.errorSources as TErrorSoures[];
 message = simplifiedError.message; 
}

//Mongoose Validation Error
else if (err.name === "ValidationError") {
 const simplifiedError = handleValidationError(err);
 statusCode = simplifiedError.statusCode;
 message = simplifiedError.message; 
 errorSources = simplifiedError.errorSources as TErrorSoures[];
}

else if (err instanceof AppError) {
  statusCode = err.statusCode;
  message = err.message;
} else if (err instanceof Error) {
  statusCode = 500;
  message = err.message;
}


    res.status(statusCode).json({
        success:false,
        statusCode,
        message,
        errorSources,
      err:envVars.NODE_ENV==="development"?err:null,
      stack:envVars.NODE_ENV==="development"?err.stack:null,
    })
}