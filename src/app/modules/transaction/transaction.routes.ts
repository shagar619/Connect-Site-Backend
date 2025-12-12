// src/app/modules/transaction/transaction.route.ts

import express from "express";
import { TransactionControllers } from "./transaction.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequrest";
import { TransactionValidations } from "./transaction.validation";

const router = express.Router();

// 💵 সেলারের উত্তোলনের অনুরোধ
router.post(
  "/withdrawal",
  checkAuth(Role.SELLER), // শুধুমাত্র সেলার পারবে
  validateRequest(TransactionValidations.createWithdrawalSchema),
  TransactionControllers.createWithdrawal
);

router.get(
  "/all-history",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN), 
  TransactionControllers.getAllTransactions
);

// 📜 ব্যবহারকারীর নিজস্ব ট্রানজাকশন হিস্টরি
router.get(
  "/my-history",
  checkAuth(...Object.values(Role)), 

  TransactionControllers.getMyTransactions
);

router.get(
  "/earnings/summary",
  checkAuth(Role.SELLER), // শুধুমাত্র সেলার
  TransactionControllers.getSellerFinancialSummary
);

export const TransactionRoutes = router;
