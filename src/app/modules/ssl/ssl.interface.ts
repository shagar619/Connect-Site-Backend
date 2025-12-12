/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/modules/ssl/ssl.interface.ts

import { Types } from "mongoose";

// ক্লায়েন্ট থেকে আসা ডেটা (বা অর্ডার থেকে নেওয়া ডেটা)
export interface ISSLCommerz {
  amount: number;
  transactionId: string; // Order ID বা নতুন Transaction ID
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
}

// ট্রানজাকশন স্ট্যাটাস আপডেটের জন্য
export interface IPaymentUpdatePayload {
  transactionId: string;
  amount: number;
  status: "success" | "fail" | "cancel" | "validate";
  val_id?: string;
}

// পেমেন্ট মডিউলের জন্য মডেল (যদি প্রয়োজন হয়)
// এই মডেলে শুধুমাত্র পেমেন্টের তথ্য থাকবে, অর্ডারের নয়।
export interface IPayment {
  transactionId: string;
  bookingId: Types.ObjectId;
  paymentGatewayData: any;
  status: "INITIATED" | "SUCCESS" | "FAILED" | "CANCELLED";
  amount: number;
}
