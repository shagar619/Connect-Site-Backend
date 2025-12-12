import httpStatus from "http-status-codes";

import { Order } from "../order/order.model";
import { Review } from "./review.model";
import { IReview } from "./review.interface";
import AppError from "../../errorHelpers/AppError";
import { Service } from "../service/service.model";
import { User } from "../user/user.model";

const createReview = async (payload: IReview) => {
  const { orderId, clientId } = payload;

  // 1. Load Order
  const order = await Order.findById(orderId);
  if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order not found.");

  // 2. Check if correct client
  if (order.clientId.toString() !== clientId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to review this order."
    );
  }

  // 3. Check order is completed
  if (order.orderStatus !== "COMPLETED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Review can only be submitted for completed orders."
    );
  }

  // 4. Prevent duplicate reviews
  const existingReview = await Review.findOne({ orderId });
  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this order."
    );
  }

  // 5. Add serviceId & sellerId from order
  const finalPayload: IReview = {
    ...payload,
    serviceId: order.serviceId,
    sellerId: order.sellerId,
    clientId,
  };

  // 6. Create Review
  const newReview = await Review.create(finalPayload);

  // ---------------------------
  // ⭐ 7. Update Service Ratings
  // ---------------------------
  const serviceStats = await Review.aggregate([
    { $match: { serviceId: order.serviceId } },
    {
      $group: {
        _id: "$serviceId",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  await Service.findByIdAndUpdate(order.serviceId, {
    averageRating: serviceStats[0]?.avgRating || 0,
    reviewCount: serviceStats[0]?.reviewCount || 0,
  });

  // ---------------------------
  // ⭐ 8. Update Seller (User) Rating
  // ---------------------------
  const sellerStats = await Review.aggregate([
    { $match: { sellerId: order.sellerId } },
    {
      $group: {
        _id: "$sellerId",
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await User.findByIdAndUpdate(order.sellerId, {
    averageRating: sellerStats[0]?.avgRating || 0,
  });

  // ---------------------------

  return newReview;
};


const getReviewsByServiceId = async (serviceId: string) => {
  const reviews = await Review.find({ serviceId }).populate(
    "clientId",
    "name profileImage"
  );
  return reviews;
};

// 💡 নতুন ফাংশন: সেলারের সমস্ত সার্ভিসের রিভিউ দেখা
const getReviewsBySellerId = async (sellerId: string) => {
    const reviews = await Review.find({ sellerId })
        .populate("clientId", "name profileImage") // রিভিউ দাতা
        .populate("serviceId", "title price"); // কোন সার্ভিস
    return reviews;
};

// 💡 নতুন ফাংশন: ক্লায়েন্টের দেওয়া নিজস্ব রিভিউ দেখা
const getMyReviews = async (clientId: string) => {
    const reviews = await Review.find({ clientId })
        .populate("serviceId", "title price") // কোন সার্ভিস
        .populate("sellerId", "name"); // কোন সেলারকে দেওয়া হয়েছে
    return reviews;
};

export const ReviewServices = {
  createReview,
  getReviewsByServiceId,
  getReviewsBySellerId, // নতুন
  getMyReviews, // নতুন
};