/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/modules/order/order.service.ts

import httpStatus from "http-status-codes";
import { Types } from "mongoose";

import { Service } from "../service/service.model";
import { Order } from "./order.model";
import { IOrder, OrderStatus } from "./order.interface";
import { Role } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";
import { TransactionServices } from "../transaction/transaction.services";

// ⚙️ কনস্ট্যান্ট
const PLATFORM_COMMISSION_RATE = 0.1;

// অর্ডারের ইনপুট টাইপ
 interface ICreateOrderInput  {
  serviceId: Types.ObjectId;
  quantity: number;
};

// =========================================================================
// ১. 🛒 অর্ডার তৈরি (Create Order)
// =========================================================================
const createOrder = async (
  clientId: Types.ObjectId | string,
  payload: ICreateOrderInput
) => {
  // 1. সার্ভিস চেক
  const service = await Service.findById(payload.serviceId);
  if (!service || service.isDeleted) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Service not found or currently unavailable."
    );
  }

  // =========================================================
  // 💡 নতুন লজিক: সক্রিয় অর্ডার চেক (Active Order Check)
  // =========================================================
const activeOrderStatuses = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.IN_PROGRESS,
];

// console.log(
//   "Checking active orders for client:",
//   clientId,
//   "service:",
//   payload.serviceId
// );

const existingActiveOrder = await Order.findOne({
  clientId: new Types.ObjectId(clientId),
  serviceId: new Types.ObjectId(payload.serviceId),
  orderStatus: { $in: activeOrderStatuses },
});

// console.log("Existing active order:", existingActiveOrder);

if (existingActiveOrder) {
  throw new AppError(
    httpStatus.BAD_REQUEST,
    "You already have an active order for this service. Please wait for the current one to complete or cancel it before ordering again."
  );
}

  // =========================================================

  const sellerId = service.sellerId;
  const unitPrice = service.price;

  // 2. 💵 আর্থিক হিসাব
  const totalPrice = unitPrice * payload.quantity;
  const platformFee = totalPrice * PLATFORM_COMMISSION_RATE;
  const netAmount = totalPrice - platformFee;

  // 3. 📝 অর্ডারের ডেটা
  const orderData: Partial<IOrder> = {
    serviceId: new Types.ObjectId(payload.serviceId),
    clientId: new Types.ObjectId(clientId),
    sellerId: sellerId,

    totalPrice,
    platformFee,
    netAmount,

    // ⚠️ TEMP: পেমেন্ট ফ্লো তৈরি না হওয়া পর্যন্ত
    paymentIntentId: "TEMP_PID_" + new Types.ObjectId().toString(),
  };

  const newOrder = await Order.create(orderData);
  return newOrder;
};

// =========================================================================
// ২. 📜 সমস্ত অর্ডার আনা (Get All Orders)
// =========================================================================
const getAllOrders = async (
  query: Record<string,any>,
  filter: Record<string,any>
) => {
  // 💡 এখানে GenericService.getAll কল হবে
  // আমি এখানে সহজ করে দিচ্ছি:
  const result = await Order.find(filter)
    .populate("serviceId")
    .sort(query.sortBy || "-createdAt")
    .lean();

  return result;
};

// =========================================================================
// ৩. ⚙️ স্ট্যাটাস পরিবর্তন লজিক: ACCEPT
// =========================================================================
const acceptOrder = async (
  orderId: string,
  sellerId: string,
  updateData: any
) => {
  const order = await Order.findById(orderId);

  // 1. সুরক্ষা চেক: অর্ডার সেলারের কিনা
  if (!order || order.sellerId.toString() !== sellerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Order not found or you are not the seller."
    );
  }

  // 2. স্ট্যাটাস চেক: PENDING না হলে ACCEPT করা যাবে না
  if (order.orderStatus !== OrderStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Order status must be ${OrderStatus.PENDING} to be accepted.`
    );
  }

  const result = await Order.findByIdAndUpdate(
    orderId,
    {
      orderStatus: OrderStatus.ACCEPTED,
      deliveryDate: updateData.deliveryDate, // ডেলিভারি ডেট আপডেট
    },
    { new: true }
  );
  return result;
};

const inProgressOrder = async (
  orderId: string,
  sellerId: string,

) => {
  const order = await Order.findById(orderId);

  // 1. সুরক্ষা চেক: অর্ডার সেলারের কিনা
  if (!order || order.sellerId.toString() !== sellerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Order not found or you are not the seller."
    );
  }

  // 2. স্ট্যাটাস চেক: ACCEPTED না হলে IN_PROGRESS করা যাবে না
  if (order.orderStatus !== OrderStatus.ACCEPTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Order status must be ${OrderStatus.ACCEPTED} to start work (IN_PROGRESS).`
    );
  }

  // 3. আপডেট
  const result = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: OrderStatus.IN_PROGRESS },
    { new: true }
  );
  return result;
};

// =========================================================================
// ৪. ⚙️ স্ট্যাটাস পরিবর্তন লজিক: DELIVER
// =========================================================================
const deliverOrder = async (
  orderId: string,
  sellerId: string,
  updateData: any
) => {
  const order = await Order.findById(orderId);

  if (!order || order.sellerId.toString() !== sellerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Order not found or you are not the seller."
    );
  }

  if (
    order.orderStatus !== OrderStatus.ACCEPTED &&
    order.orderStatus !== OrderStatus.IN_PROGRESS
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Order must be accepted or in progress to be delivered."
    );
  }

  const result = await Order.findByIdAndUpdate(
    orderId,
    {
      orderStatus: OrderStatus.DELIVERED,
      deliveryNote: updateData?.deliveryNote,
      deliveredFiles: updateData?.deliveredFiles,
    },
    { new: true }
  );

  return result;
};


// =========================================================================
// ৫. ⚙️ স্ট্যাটাস পরিবর্তন লজিক: COMPLETE
// =========================================================================
const completeOrder = async (orderId: string, clientId: string) => {
  const order = await Order.findById(orderId);

  // 1. সুরক্ষা চেক: ক্লায়েন্ট এবং স্ট্যাটাস
  if (!order || order.clientId.toString() !== clientId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Order not found or you are not the client."
    );
  }
  if (order.orderStatus !== OrderStatus.DELIVERED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only delivered orders can be completed."
    );
  }

  // 2. স্ট্যাটাস COMPLETED করা
  const result = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: OrderStatus.COMPLETED },
    { new: true }
  );

  // 3. 💸 ট্রানজাকশন লজিক যুক্ত করা (সেটেলমেন্ট)
  if (result) {
    // 💡 TransactionService কল: সেলারকে টাকা দেওয়ার প্রক্রিয়া শুরু করা
    await TransactionServices.creditSeller(result as IOrder);
  }

  return result;
};

// =========================================================================
// ৬. ⚙️ স্ট্যাটাস পরিবর্তন লজিক: CANCEL
// =========================================================================
const cancelOrder = async (
  orderId: string,
  userId: string | null,
  userRole: Role | null,
  updateData: any
) => {
  // 1. অর্ডার আনা
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found.");
  }

  // 2. প্রাথমিক স্ট্যাটাস চেক (PENDING বা ACCEPTED না হলে ক্যানসেল করা যাবে না)
if (
  order.orderStatus !== OrderStatus.PENDING &&
  order.orderStatus !== OrderStatus.ACCEPTED
) {
  throw new AppError(
    httpStatus.BAD_REQUEST,
    "Only PENDING or ACCEPTED orders can be cancelled."
  );
}


  // 3. সুরক্ষা: সঠিক ইউজার কিনা
  const isSystemCall = userId === null && userRole === null; // 💡 SSLCommerz ওয়েবুক কল বাইপাস

  if (!isSystemCall) {
    if (
      order.clientId.toString() !== userId &&
      order.sellerId.toString() !== userId &&
      userRole !== Role.ADMIN &&
      userRole !== Role.SUPER_ADMIN
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to cancel this order."
      );
    }
  }

  // 4. স্ট্যাটাস CANCELLED করা
  const result = await Order.findByIdAndUpdate(
    orderId,
    {
      orderStatus: OrderStatus.CANCELLED,
      cancellationReason:
        updateData.cancellationReason || "No reason provided.",
    },
    { new: true }
  );

  // 5. 💰 রিফান্ড লজিক (যদি isPaid === true হয়)
  if (result && result.isPaid) {
    // 💡 TransactionService কল: রিফান্ড প্রক্রিয়া শুরু করা
    await TransactionServices.processRefund(result as IOrder);
  }

  return result;
};


// order.services.ts - Add this method

const updatePaymentStatus = async (orderId: string, isPaid: boolean) => {
  const newStatus = isPaid ? OrderStatus.PENDING : OrderStatus.PENDING;
  const updated = await Order.findByIdAndUpdate(
    orderId,
    {
      isPaid,
      orderStatus: newStatus,
      paidAt: isPaid ? new Date() : null,
    },
    { new: true }
  );
  return updated;
};



export const OrderServices = {
  createOrder,
  getAllOrders,
  acceptOrder,
  inProgressOrder,
  deliverOrder,
  completeOrder,
  cancelOrder,
  updatePaymentStatus,
  // getSingleOrder এর জন্য GenericService ব্যবহার করা হবে
};
