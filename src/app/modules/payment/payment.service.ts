/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/modules/payment/payment.service.ts

import { SSLService } from "../ssl/ssl.service";
import { OrderStatus, IOrder } from "../order/order.interface";
import { IPaymentUpdatePayload } from "../ssl/ssl.interface";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { TransactionServices } from "../transaction/transaction.services";
import { OrderServices } from "../order/order.services";
import { GenericService } from "../order/base.service";
import { Order } from "../order/order.model";

type PaymentStatusResult = IOrder | null;

// 1. পেমেন্ট ইনিশিয়েট করা
const initPayment = async (bookingId: string, user: any) => {
  // <CHANGE> Pass the Model and cast the result to IOrder
  const order = (await GenericService.getSingle(
    Order,
    bookingId
  )) as IOrder | null;

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found.");
  }
  if (order.orderStatus !== OrderStatus.PENDING || order.isPaid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Order is not ready for payment."
    );
  }

  // 💡 FIX: user.name এবং user.email চেক করার জন্য নিরাপদ ডিফল্ট ব্যবহার
  const paymentPayload = {
    amount: order.totalPrice,
    transactionId: order._id?.toString() || "",

    name: user.name || "Client User", // ডিফল্ট বা সেইফগার্ড
    email: user.email || "client@example.com", // ডিফল্ট বা সেইফগার্ড
    address: user.address || "Address",
    phoneNumber: user.phoneNumber || "01XXXXXXXXX",
  };

  // <CHANGE> You need to add this method to TransactionServices
  await TransactionServices.recordInitialPayment(order);

  const sslResponse = await SSLService.sslPaymentInit(paymentPayload);
  return sslResponse;
};

// 2. SSLCommerz ওয়েবুক হ্যান্ডেল করা (Success/Fail/Cancel/Validate)
const handlePaymentStatusUpdate = async (
  payload: IPaymentUpdatePayload
): Promise<PaymentStatusResult> => {
  const orderId = payload.transactionId;

  const isSuccessCall =
    payload.status === "success" || payload.status === "validate";

  let isValidated = false;
  let validationData = null;

  if (payload.val_id) {
    const validationResult = await SSLService.validatePayment({
      val_id: payload.val_id,
      tran_id: orderId,
    });
    isValidated = validationResult.isValid;
    validationData = validationResult.validationData;
  }

  const isPaymentFinalSuccess =
    isSuccessCall && (payload.val_id ? isValidated : true);

  if (isPaymentFinalSuccess) {
    await OrderServices.updatePaymentStatus(orderId, true);
    await TransactionServices.updateStatus(orderId, "SUCCESS", validationData);

    const updatedOrder = await GenericService.getSingle(Order, orderId, [
      "serviceId",
      "sellerId",
      "clientId",
    ]);

    return updatedOrder; // success হলে full order
  } else {
    await OrderServices.updatePaymentStatus(orderId, false);
    await TransactionServices.updateStatus(orderId, "FAILED", validationData);
    await OrderServices.cancelOrder(orderId, null, null, {
      cancellationReason: `Payment ${payload.status} by gateway or user.`,
    });

    return null; // failed হলে null
  }
};


export const PaymentService = {
  initPayment,
  handlePaymentStatusUpdate,
};
