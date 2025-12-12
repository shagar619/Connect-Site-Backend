/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction, TransactionDocument } from "./transaction.model";
import { TransactionType, TransactionStatus } from "./transaction.interface";
import { IOrder, OrderStatus } from "../order/order.interface";
import { Types } from "mongoose";
import { Order } from "../order/order.model";

// 💰 Seller balance check
const getSellerBalance = async (sellerId: Types.ObjectId) => {
  const agg = await Transaction.aggregate([
    { $match: { userId: sellerId, status: "SUCCESS" } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);

  let totalEarned = 0;
  let totalWithdrawn = 0;

  agg.forEach((item) => {
    if (item._id === TransactionType.SETTLEMENT) totalEarned = item.total;
    if (item._id === TransactionType.WITHDRAWAL) totalWithdrawn = item.total;
  });

  return totalEarned - totalWithdrawn;
};

// 💸 Successful order settlement to seller
const creditSeller = async (order: IOrder): Promise<void> => {
  if (!order.isPaid) return;

  // ১. Seller settlement
  await Transaction.create({
    relatedOrder: order._id,
    userId: order.sellerId,
    type: TransactionType.SETTLEMENT,
    status: TransactionStatus.SUCCESS,
    amount: order.netAmount,
    description: `Order settlement (${order._id}). Net amount credited to seller.`,
  });

  // ২. Platform fee deduction (optional)
  await Transaction.create({
    relatedOrder: order._id,
    userId: order.sellerId,
    type: TransactionType.FEE,
    status: TransactionStatus.SUCCESS,
    amount: -order.platformFee,
    description: `Platform commission deducted for order ${order._id}.`,
  });
};

// 💰 Process refund for cancelled order
const processRefund = async (order: IOrder): Promise<any> => {
  if (!order.isPaid)
    return { success: true, message: "Order was not paid. No refund needed." };

  // Update order status
  const orderUpdateResult = await Order.findByIdAndUpdate(
    order._id,
    { orderStatus: OrderStatus.REFUNDED },
    { new: true }
  ).lean();

  // Record refund transaction
  await Transaction.create({
    relatedOrder: order._id,
    userId: order.clientId,
    type: TransactionType.REFUND,
    status: TransactionStatus.SUCCESS,
    amount: order.totalPrice,
    description: `Refund processed for cancelled order ${order._id}.`,
  });

  return orderUpdateResult;
};

// 💵 Seller withdrawal (immediate deduction)
const createWithdrawal = async (
  sellerId: Types.ObjectId,
  amount: number
): Promise<TransactionDocument> => {
  // Check balance
  const balance = await getSellerBalance(sellerId);
  if (amount > balance) throw new Error("Insufficient balance for withdrawal.");

  // Create withdrawal transaction (amount negative for deduction)
  const withdrawal = await Transaction.create({
    userId: sellerId,
    type: TransactionType.WITHDRAWAL,
    status: TransactionStatus.SUCCESS,
    amount: -amount,
    description: `Withdrawal of ${amount} initiated by seller.`,
  });

  return withdrawal;
};

// 📜 Get user's transaction history
const getMyTransactions = async (
  userId: Types.ObjectId,
  query: Record<string, any>
) => {
  const transactions = await Transaction.find({ userId, ...query })
    .sort("-createdAt")
    .lean();
  return transactions;
};

// Get all transactions (admin)
const getAllTransactions = async (query: Record<string, any>) => {
  const result = await Transaction.find({})
    .sort(query.sortBy || "-createdAt")
    .limit(query.limit || 10)
    .skip((query.page || 0) * (query.limit || 10))
    .lean();
  return result;
};

// Record initial payment for order
const recordInitialPayment = async (order: IOrder) => {
  await Transaction.create({
    relatedOrder: order._id,
    userId: order.clientId,
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.INITIATED,
    amount: order.totalPrice,
    description: `Initial payment initiated for order ${order._id}`,
  });
};

// Update transaction status
const updateStatus = async (
  orderId: string,
  status: "SUCCESS" | "FAILED",
  validationData?: any
) => {
  const updated = await Transaction.findOneAndUpdate(
    { orderId },
    { status, paymentGatewayData: validationData, updatedAt: new Date() },
    { new: true }
  );
  return updated;
};

// Calculate seller financial summary
const calculateSellerSummary = async (sellerId: string) => {
  const sellerObjectId = new Types.ObjectId(sellerId);

  // Total earned (SETTLEMENT)
  const totalEarnedAgg = await Transaction.aggregate([
    {
      $match: {
        userId: sellerObjectId,
        type: TransactionType.SETTLEMENT,
        status: TransactionStatus.SUCCESS,
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalEarned = totalEarnedAgg[0]?.total || 0;

  // Total withdrawn (WITHDRAWAL)
  const totalWithdrawnAgg = await Transaction.aggregate([
    {
      $match: {
        userId: sellerObjectId,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.SUCCESS,
      },
    },
    { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } }, // use abs because amount negative
  ]);
  const totalWithdrawn = totalWithdrawnAgg[0]?.total || 0;

  // Available balance
  const availableBalance = totalEarned - totalWithdrawn;

  return { totalEarned, totalWithdrawn, availableBalance };
};

export const TransactionServices = {
  creditSeller,
  processRefund,
  createWithdrawal,
  getMyTransactions,
  getAllTransactions,
  recordInitialPayment,
  updateStatus,
  calculateSellerSummary,
};
