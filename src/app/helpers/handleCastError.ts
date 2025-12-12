/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import { TGenaricErrorResponse } from "../interfaces/error.types";

export const handleCastError = (err: mongoose.Error.CastError):TGenaricErrorResponse => { 
    return {
      statusCode: 400,
      message: "Invalid MongoDB ObjectId. Please provide a valid id.",
    };
}