// src/app/modules/transaction/transaction.interface.ts

import { Types } from "mongoose";

export enum TransactionType {
  DEPOSIT = "DEPOSIT", // ক্লায়েন্ট কর্তৃক পেমেন্ট (এসক্রো-তে বা প্ল্যাটফর্মে)
  FEE = "FEE", // প্ল্যাটফর্ম কমিশন কেটে নেওয়া
  WITHDRAWAL = "WITHDRAWAL", // সেলারের উত্তোলন
  REFUND = "REFUND", // ক্লায়েন্টকে ফেরত
  SETTLEMENT = "SETTLEMENT", // সেলারের অ্যাকাউন্টে অর্ডারের টাকা জমা
}
export enum TransactionStatus {
  SUCCESS = "SUCCESS",
  PENDING = "PENDING",
  DEPOSIT = "DEPOSIT",
  FAILED = "FAILED",
  INITIATED = "INITIATED",
}
export interface ITransaction {
  _id?: Types.ObjectId;
  userId: Types.ObjectId; // যার অ্যাকাউন্ট/ওয়ালেট প্রভাবিত হয়েছে
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  relatedOrder?: Types.ObjectId; // যদি অর্ডার সম্পর্কিত হয়
  paymentIntentId?: string; // পেমেন্ট গেটওয়ে রেফারেন্স (যেমন Stripe/SSLCommerz)
  description: string;
  createdAt?: Date;
}
