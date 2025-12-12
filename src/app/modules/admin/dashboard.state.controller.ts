import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Service } from "../service/service.model";
import {
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import { Order } from "../order/order.model";
import { OrderStatus } from "../order/order.interface";

const getDashboardStats = catchAsync(async (req, res) => {
  // 12 মাসের array
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // 1️⃣ সাধারণ summary stats
  const [
    totalUsers,
    totalSellers,
    totalClients,
    totalAdmins,
    totalServices,
    totalOrders,
    successfulPayments,
    cancelledOrders,
    revenueStats,
    commissionStats,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "SELLER" }),
    User.countDocuments({ role: "CLIENT" }),
    User.countDocuments({ role: "ADMIN" }),
    Service.countDocuments(),
    Transaction.countDocuments(),
    Transaction.countDocuments({ status: TransactionStatus.SUCCESS }),
    Order.countDocuments({ orderStatus: OrderStatus.CANCELLED }),
    // মোট revenue
    Transaction.aggregate([
      { $match: { status: TransactionStatus.SUCCESS } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    // মোট commission
    Transaction.aggregate([
      {
        $match: {
          type: TransactionType.FEE,
          status: TransactionStatus.SUCCESS,
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalRevenue = revenueStats?.[0]?.total || 0;
  const totalCommission = Math.abs(commissionStats?.[0]?.total || 0);

  // 2️⃣ 12 মাসের Revenue & Commission
  const monthlyRevenueAgg = await Transaction.aggregate([
    { $match: { status: TransactionStatus.SUCCESS } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$amount" },
      },
    },
  ]);

  const monthlyCommissionAgg = await Transaction.aggregate([
    {
      $match: {
        type: TransactionType.FEE,
        status: TransactionStatus.SUCCESS,
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        commission: { $sum: "$amount" },
      },
    },
  ]);

  const monthlyStats = months.map((month, index) => {
    const monthIndex = index + 1;
    const revenueEntry = monthlyRevenueAgg.find((r) => r._id === monthIndex);
    const commissionEntry = monthlyCommissionAgg.find(
      (c) => c._id === monthIndex
    );
    return {
      month,
      revenue: revenueEntry?.revenue || 0,
      commission: commissionEntry?.commission || 0,
    };
  });

  // 3️⃣ 12 মাসের Orders (optional)
  const monthlyOrdersAgg = await Order.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        completed: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "COMPLETED"] }, 1, 0] },
        },
        cancelled: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$orderStatus",
                  [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
                ],
              },
              1,
              0,
            ],
          },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "PENDING"] }, 1, 0] },
        },
      },
    },
  ]);

  const monthlyOrders = months.map((month, index) => {
    const monthIndex = index + 1;
    const entry = monthlyOrdersAgg.find((e) => e._id === monthIndex);
    return {
      month,
      completed: entry?.completed || 0,
      cancelled: entry?.cancelled || 0,
      pending: entry?.pending || 0,
    };
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin dashboard stats loaded successfully",
    data: {
      totalUsers,
      totalSellers,
      totalClients,
      totalAdmins,
      totalServices,
      totalOrders,
      cancelledOrders,
      successfulPayments,
      totalRevenue,
      totalCommission,
      monthlyStats, // 12 মাসের revenue & commission
      monthlyOrders, // 12 মাসের orders
    },
  });
});

export const AdminController = {
  getDashboardStats,
};
