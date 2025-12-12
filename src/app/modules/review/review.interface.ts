// src/app/modules/review/review.interface.ts

import { Types } from "mongoose";

export interface IReview {
  serviceId?: Types.ObjectId;
  sellerId?: Types.ObjectId;
  clientId: Types.ObjectId;
  rating: number; // 1 to 5
  comment?: string;
  orderId: Types.ObjectId;
}
