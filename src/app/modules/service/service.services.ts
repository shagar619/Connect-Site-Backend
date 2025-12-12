/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";

import { Service } from "./service.model";
import { IService } from "./service.interface";
import AppError from "../../errorHelpers/AppError";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { serviceSearchableFields } from "./serviceSearchableFields";

// 1. সার্ভিস তৈরি (বিক্রেতা কর্তৃক)
const createService = async (
  sellerId: string,
  payload: Partial<IService> 
) => {
  const serviceData = {
    ...payload,
    sellerId,
  
  };
  const newService = await Service.create(serviceData);
  return newService;
};

export const getMyServices = async (filters: any, sellerId?: string) => {
  const query: any = { ...filters };
  if (sellerId) {
    query.sellerId = sellerId;
  }

  const services = await Service.find(query);
  return services;
};


const getAllServices = async (query: Record<string, any>) => {
  // Step 1: start query with default filters
  const baseQuery = Service.find({ status: "LIVE", isDeleted: false });

  // Step 2: build query with QueryBuilder
  const qb = new QueryBuilder(baseQuery, query);

  const builtQuery = qb
    .filter()
    .search(serviceSearchableFields)
    .sort()
    .fields()
    .paginate()
    .build();

  // Step 3: populate seller info
  const populatedQuery = builtQuery.populate(
    "sellerId",
    "name profilePicture averageRating"
  );

  // Step 4: execute query + meta
  const [data, meta] = await Promise.all([populatedQuery, qb.getMeta()]);

  return { data, meta };
};









// 3. একটি নির্দিষ্ট সার্ভিস দেখা
const getServiceById = async (id: string) => {

  const service = await Service.findById(id).populate(
    "sellerId",
    "name email profilePicture averageRating bio"
  );
  if (!service || service.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found.");
  }
  return service;
};

// 4. সার্ভিস আপডেট করা (বিক্রেতা কর্তৃক)
const updateService = async (
  serviceId: string,
  sellerId: string,
  updateData: Partial<IService>
) => {
  const service = await Service.findById(serviceId);

  if (!service || service.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found.");
  }

  // নিশ্চিত করা যে শুধুমাত্র সেলারই তার সার্ভিস আপডেট করতে পারে
  if (service.sellerId.toString() !== sellerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this service."
    );
  }

  // ⚠️ যদি ইমেজ পরিবর্তন হয়, পুরনো ইমেজ ক্লাউডিনারি থেকে ডিলেট করার লজিক এখানে যুক্ত হবে
  // যেমন: if (updateData.images) { deleteOldImages(service.images); }
 if (service.image && service.image) {
    await deleteImageFromCLoudinary(service.image);
  }
    
  const updatedService = await Service.findByIdAndUpdate(
    serviceId,
    updateData,
    { new: true, runValidators: true }
  );
  return updatedService;
};

// 5. সার্ভিস ডিলেট করা (সফট ডিলেট - বিক্রেতা কর্তৃক)
const deleteService = async (serviceId: string, sellerId: string) => {
  const service = await Service.findById(serviceId);

  if (!service || service.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found.");
  }

  if (service.sellerId.toString() !== sellerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this service."
    );
  }

  // সফট ডিলেট: isDeleted: true এবং স্ট্যাটাস PAUSED করা হলো
  const result = await Service.findByIdAndDelete(serviceId);
  return result;
};

export const ServiceServices = {
  createService,
  getAllServices,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
};
