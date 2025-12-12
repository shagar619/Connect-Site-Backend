// src/app/modules/transaction/transaction.model.ts

import { Schema, model, Document } from "mongoose";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";

// Mongoose ডকুমেন্ট ইন্টারফেস
export type TransactionDocument = ITransaction & Document;

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.INITIATED,
      required: true,
    },
    amount: { type: Number, required: true },
    relatedOrder: { type: Schema.Types.ObjectId, ref: "Order" },
    paymentIntentId: { type: String },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
