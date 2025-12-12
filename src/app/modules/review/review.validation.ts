// src/app/modules/review/review.validation.ts (সংশোধিত)

import { z } from "zod";
import { Types } from "mongoose";

// 💡 Mongoose ObjectId ভ্যালিডেশন (কোনো .strict() নেই)
const objectIdSchema = z.string().refine(
  (val) => {
    return Types.ObjectId.isValid(val);
  },
  {
    message: "Invalid MongoDB ObjectId format.",
  }
);

// নতুন রিভিউ তৈরির ভ্যালিডেশন স্কিমা (ক্লায়েন্টের জন্য)
const createReviewValidationSchema = z.object({
  // 🚀 .strict() অবজেক্টের বাইরে প্রয়োগ হবে
  body: z
    .object({
      orderId: objectIdSchema.refine((val) => val, {
        // 💡 শুধু objectIdSchema ব্যবহার করুন
        message: "Order ID must be a valid MongoDB ObjectId.",
      }),

      // 💡 রেটিং ভ্যালিডেশন: অবশ্যই ১ থেকে ৫ এর মধ্যে হতে হবে
      rating: z
        .number({
          required_error: "Rating is required.",
          invalid_type_error: "Rating must be a number.",
        })
        .int("Rating must be an integer.") // পূর্ণ সংখ্যা নিশ্চিত করা হলো
        .min(1, "Rating must be at least 1.")
        .max(5, "Rating cannot exceed 5."),

      // 💡 কমেন্ট ভ্যালিডেশন: কমপক্ষে ১০ অক্ষর
      comment: z
        .string({
          required_error: "Comment is required.",
        })
        .min(10, "Comment must be at least 10 characters long.")
        .max(500, "Comment cannot exceed 500 characters.")
        .optional(),
    })
    .strict(
      "Request body contains unexpected keys. Only orderId, rating, and comment are allowed."
    ), // 🚀 .strict() এখানে যোগ করা হয়েছে
});

export const ReviewValidations = {
  createReviewValidationSchema,
};
