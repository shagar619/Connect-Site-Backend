import { Schema, model } from "mongoose";
import { IService, ServiceStatus } from "./service.interface";

const serviceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    description: { type: String, required: true, trim: true, minlength: 20 },
    price: { type: Number, required: true, min: 1 },
    deliveryTime: { type: Number, required: true, min: 1, max: 60 },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },

    // 📸 পরিবর্তন: সিঙ্গেল ইমেজ URL
    image: { type: String, required: true, default: "" },

    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.LIVE,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ... ইনডেক্সিং লজিক অপরিবর্তিত ...

export const Service = model<IService>("Service", serviceSchema);
