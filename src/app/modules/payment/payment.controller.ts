/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/modules/payment/payment.controller.ts

import { Request, Response } from "express";

import httpStatus from "http-status-codes";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { envVars } from "../../config/env";


// 1. পেমেন্ট শুরু
const initPayment = catchAsync(async (req: Request, res: Response) => {
  const bookingId = req.params.bookingId;
    const user = req.user; // checkAuth middleware থেকে আসা ইউজার ডেটা
    // console.log("from payment controller","booking id",bookingId,"suer",user);

  const result = await PaymentService.initPayment(bookingId, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initiation successful.",
    data: result, // { GatewayPageURL: "..." }
  });
});

// 2. SSL SUCCESS Webhook/Redirect
// payment.controller.ts - Fix the type casting for query params

const successPayment = catchAsync(async (req: Request, res: Response) => {
  const payload = req.query || req.body;

  const updatedOrder = await PaymentService.handlePaymentStatusUpdate({
    transactionId: String(payload.tran_id || payload.transactionId || ""),
    amount: parseFloat(String(payload.amount || "0")),
    status: "success",
    val_id: payload.val_id ? String(payload.val_id) : undefined,
  });

  if (updatedOrder) {
    res.redirect(
      `${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?orderId=${updatedOrder._id}`
    );
  } else {
    res.redirect(envVars.SSL.SSL_FAIL_FRONTEND_URL);
  }
});


const failPayment = catchAsync(async (req: Request, res: Response) => {
  const payload = req.query || req.body;

  // <CHANGE> Cast query params to string properly
  await PaymentService.handlePaymentStatusUpdate({
    transactionId: String(payload.tran_id || payload.transactionId || ""),
    amount: parseFloat(String(payload.amount || "0")),
    status: "fail",
  });

  res.redirect(envVars.SSL.SSL_FAIL_FRONTEND_URL as string);
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  const payload = req.query || req.body;

  // <CHANGE> Cast query params to string properly
  await PaymentService.handlePaymentStatusUpdate({
    transactionId: String(payload.tran_id || payload.transactionId || ""),
    amount: parseFloat(String(payload.amount || "0")),
    status: "cancel",
  });

  res.redirect(envVars.SSL.SSL_CANCEL_FRONTEND_URL as string);
});

// 4. IPN / Webhook (সার্ভার-টু-সার্ভার কল)
const validatePayment = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  // Payment update handle
  const order = await PaymentService.handlePaymentStatusUpdate({
    transactionId: payload.tran_id,
    amount: parseFloat(payload.amount),
    status: "success",
    val_id: payload.val_id,
  });

  // order থাকলে SUCCESS, না থাকলে FAILED
  const status = order ? "SUCCESS" : "FAILED";

  res.status(httpStatus.OK).json({
    status,
    message: "IPN processed.",
  });
});


// 5. ইনভয়েস (আপনাকে এই লজিকটি পরে তৈরি করতে হবে)
const getInvoiceDownloadUrl = catchAsync(
  async (req: Request, res: Response) => {
    // 💡 টেম্পোরারি লজিক
    sendResponse(res, {
      statusCode: httpStatus.NOT_IMPLEMENTED,
      success: false,
      message: "Invoice generation logic is not yet implemented.",
      data: null,
    });
  }
);

export const PaymentControllers = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  validatePayment,
  getInvoiceDownloadUrl,
};
