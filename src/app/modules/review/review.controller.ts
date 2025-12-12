import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ReviewServices } from "./review.services";
import { Review } from "./review.model";

// -------------------------
// 📝 নতুন রিভিউ তৈরি
// -------------------------
const createReview = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body, clientId: req.user?.userId };
  const result = await ReviewServices.createReview(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review submitted successfully!",
    data: result,
  });
});

// -------------------------
// 🔍 নির্দিষ্ট সার্ভিসের রিভিউ
// -------------------------
const getReviewsByServiceId = catchAsync(
  async (req: Request, res: Response) => {
    const { serviceId } = req.params;
    const result = await ReviewServices.getReviewsByServiceId(serviceId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reviews retrieved successfully.",
      data: result,
    });
  }
);

// -------------------------
// 💼 সেলারের সব সার্ভিসের রিভিউ
// -------------------------
const getReviewsBySellerId = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user.userId; 

  const result = await ReviewServices.getReviewsBySellerId(sellerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Seller's reviews retrieved successfully.",
    data: result,
  });
});

// -------------------------
// 👤 ক্লায়েন্টের নিজের রিভিউ
// -------------------------
const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const clientId = req.user?.userId as string;
  const result = await ReviewServices.getMyReviews(clientId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Your submitted reviews retrieved successfully.",
    data: result,
  });
});

// -------------------------
// 👑 ADMIN: সব রিভিউ
// -------------------------
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await Review.find()
    .populate("clientId", "name email")
    .populate("sellerId", "name email")
    .populate("serviceId", "_id title");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All reviews retrieved successfully",
    data: reviews,
  });
});

export const ReviewControllers = {
  createReview,
  getReviewsByServiceId,
  getReviewsBySellerId,
  getMyReviews,
  getAllReviews,
};
