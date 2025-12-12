// src/app/modules/transaction/transaction.validation.ts

import { z } from "zod";

// 💰 সেলারের টাকা উত্তোলনের জন্য ইনপুট ভ্যালিডেশন
const createWithdrawalSchema = z.object({

      amount: z
        .number({
          required_error: "Amount is required for withdrawal.",
        })
        .positive("Amount must be a positive number."),
    })
   


// 📜 ট্রানজাকশন হিস্টরি কোয়েরি ভ্যালিডেশন
const transactionQuerySchema = z.object({
  query: z.object({
    type: z
      .enum(["DEPOSIT", "FEE", "WITHDRAWAL", "REFUND", "SETTLEMENT"])
      .optional(),
    status: z.enum(["SUCCESS", "PENDING", "FAILED", "INITIATED"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const TransactionValidations = {
  createWithdrawalSchema,
  transactionQuerySchema,
};
