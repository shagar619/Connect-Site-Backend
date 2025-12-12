/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";

import { ServiceServices } from "./service.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IService } from "./service.interface";

// সার্ভিসে ইমেজ আপলোড মেকানিজম আছে বলে ধরে নেওয়া হচ্ছে
const createService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
        const sellerId = req.user.userId; // JWT থেকে সেলারের ID
      

        
         const payload: IService = {
           ...req.body,
           image: req.file?.path,
         };

   
    const result = await ServiceServices.createService(sellerId, payload);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Service posted successfully.",
      data: result,
    });
  }
);

const getMyServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.user.userId; 
    const result = await ServiceServices.getMyServices({},sellerId);


    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Your services retrieved successfully.",
      data: result,
      
    });
  }
);


const getAllServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ServiceServices.getAllServices(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Services retrieved successfully.",
      data: result,
    });
  }
);


const getServiceById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await ServiceServices.getServiceById(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Service retrieved successfully.",
      data: result,
    });
  }
);

const updateService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
        const sellerId = req.user.userId;
         const payload: IService = {
             ...req.body,
             image: req.file?.path,
           };

    const result = await ServiceServices.updateService(id, sellerId, payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Service updated successfully.",
      data: result,
    });
  }
);

const deleteService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const sellerId = req.user.userId;

    const result = await ServiceServices.deleteService(id, sellerId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Service deleted successfully (Soft Delete).",
      data: result,
    });
  }
);

export const ServiceControllers = {
  createService,
  getAllServices,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
};
