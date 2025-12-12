// src/app/modules/review/review.model.ts

import { Schema, model } from "mongoose";
import { IReview } from "./review.interface";

const ReviewSchema = new Schema<IReview>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: false,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
  type: Schema.Types.ObjectId,
  ref: "User",
  required: true,
}
,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Review শুধুমাত্র COMPLETED অর্ডারের জন্যই দেওয়া যাবে, তাই orderId প্রয়োজন
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // একটি অর্ডারের জন্য একবারই রিভিউ দেওয়া যাবে
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

// Mongoose-এ একটি সার্ভিস-এর রিভিউ এভারেজ রেটিং আপডেট করার জন্য স্ট্যাটিক বা ইনস্ট্যান্স মেথড যোগ করতে পারেন।

export const Review = model<IReview>("Review", ReviewSchema);
