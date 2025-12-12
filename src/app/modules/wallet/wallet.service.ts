// src/app/modules/wallet/wallet.service.ts

import { Types } from "mongoose";


import { Wallet } from "./wallet.model";
import { TransactionServices } from "../transaction/transaction.services";

// Seller এর জন্য balance fetch করা
export const getWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ userId: new Types.ObjectId(userId) });
  return wallet || { balance: 0, totalWithdrawn: 0, totalEarned: 0 };
};

// Seller কে টাকা credit করা (SETTLEMENT)
export const creditWallet = async (userId: string, amount: number) => {
  let wallet = await Wallet.findOne({ userId: new Types.ObjectId(userId) });
  const userObjectId = new Types.ObjectId(userId);

  if (!wallet) {
    wallet = await Wallet.create({
      userId: userObjectId,
      balance: amount,
      totalEarned: amount,
      totalWithdrawn: 0,
    });
  } else {
    wallet.balance += amount;
    wallet.totalEarned += amount;
    await wallet.save();
  } // ❌ এখানে `createWithdrawal` কল করা ভুল। Settlement ট্রানজেকশন Order service থেকে হবে। // এই ফাংশনটি শুধু Wallet-এ ক্রেডিট করবে।

  return wallet;
};

// Seller withdrawal request - 💡 সমস্ত লজিক এখানে একত্রিত করা হলো
export const withdrawFromWallet = async (userId: string, amount: number) => {
  const userObjectId = new Types.ObjectId(userId);
  let wallet = await Wallet.findOne({ userId: userObjectId });

  if (!wallet) {
    // ✅ সংশোধন: ওয়ালেট না পেলে, নতুন একটি Wallet তৈরি করে দিন
    wallet = await Wallet.create({
      userId: userObjectId,
      balance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    }); // যেহেতু নতুন ওয়ালেটের ব্যালেন্স ০, তাই এটি "Insufficient balance" এরর দেবে, যা ঠিক আছে।
  } // 1. ব্যালেন্স চেক (নতুন ওয়ালেট হলে ব্যালেন্স < amount হবে, তাই এখানে এরর দেবে)

  if (wallet.balance < amount) throw new Error("Insufficient balance"); // 2. PENDING ট্রানজেকশন রেকর্ড তৈরি

  const transaction = await TransactionServices.createWithdrawal(
    userObjectId,
    amount
  ); // 3. ওয়ালেট আপডেট (ব্যালেন্স কমানো)

  wallet.balance -= amount;
  wallet.totalWithdrawn += amount;
  await wallet.save();

  return { wallet, transaction };
};
