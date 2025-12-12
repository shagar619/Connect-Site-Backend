// src/app/modules/ssl/ssl.service.ts (চূড়ান্ত সংশোধন)

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { ISSLCommerz } from "./ssl.interface"; // SSLCommerz ইন্টারফেস

const config = envVars.SSL;

const sslPaymentInit = async (payload: ISSLCommerz) => {
  try {
    const data: Record<string, any> = {
      store_id: config.STORE_ID,
      store_passwd: config.STORE_PASS,
      total_amount: payload.amount,
      currency: "BDT",
      tran_id: payload.transactionId,

      // ব্যাকএন্ড URL
      success_url: `${config.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
      fail_url: `${config.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
      cancel_url: `${config.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
      ipn_url: config.SSL_IPN_URL,

      // 💡 কাস্টমার ডেটা (আবশ্যিক ফিল্ডগুলো যোগ করা হয়েছে)
      cus_name: payload.name,
      cus_email: payload.email,
      cus_phone: payload.phoneNumber,

      // কাস্টমার ঠিকানা (এই ফিল্ডগুলো পূরণ করা স্কিপিং-এর জন্য খুব জরুরি)
      cus_add1: payload.address || "Dhaka",
      cus_add2: "N/A",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000", // স্ট্রিং হিসেবে দেওয়া ভালো
      cus_country: "Bangladesh",
      // cus_fax: "01711111111", // অপশনাল, বাদ দেওয়া হলো

      // 💡 প্রোডাক্ট ও শিপিং ডেটা (পেমেন্ট মেথড সিলেকশন নিশ্চিত করার জন্য)
      shipping_method: "NO",
      product_name: "Service Order",
      product_category: "Service",
      product_profile: "general", // মাল্টিপল অপশন নিশ্চিত করে

      // শিপিং ইনফো (যদি শিপিং না থাকে, তবুও পূরণ করতে হয়)
      ship_name: "N/A",
      ship_add1: "N/A",
      ship_add2: "N/A",
      ship_city: "N/A",
      ship_state: "N/A",
      ship_postcode: 1000, // নাম্বার হিসেবেও দেওয়া যায়
      ship_country: "N/A",
    };

    const response = await axios({
      method: "POST",
      url: config.SSL_PAYMENT_API,
      data: data,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (response.data?.status !== "SUCCESS") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        response.data?.failedreason || "SSLCommerz payment initiation failed."
      );
    }

    return response.data; // { status: "SUCCESS", GatewayPageURL: "..." }
  } catch (error: any) {
    console.log("Payment Init Error Occured", error.message);
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

const validatePayment = async (payload: any) => {
  // 💡 এই ফাংশনটি অপরিবর্তিত রাখা হলো
  try {
    const response = await axios({
      method: "GET",
      url: `${config.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${config.STORE_ID}&store_passwd=${config.STORE_PASS}`,
    });

    const validationData = response.data;
    const status = validationData?.[0]?.status;

    if (status === "VALID" || status === "VALIDATED") {
      return {
        isValid: true,
        validationData,
      };
    }

    return {
      isValid: false,
      validationData,
    };
  } catch (error: any) {
    console.log("SSL Validation Error:", error.message);
    throw new AppError(401, `Payment Validation Error: ${error.message}`);
  }
};

export const SSLService = {
  sslPaymentInit,
  validatePayment,
};
