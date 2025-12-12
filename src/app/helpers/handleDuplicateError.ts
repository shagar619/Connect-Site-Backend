/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenaricErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any):TGenaricErrorResponse => {
    const matchedArray = err.message.match(/"([^"]*)"/);
    
    return {
        statusCode: 400,
          message : `${matchedArray[1]} already exists!`,
    }
 }