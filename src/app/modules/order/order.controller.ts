// src/app/modules/order/order.controller.ts

import { Request, Response } from "express";
import httpStatus from "http-status-codes"
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import { OrderStatus } from "./order.interface";
import { Role } from "../user/user.interface";

import { Order } from "./order.model";
import { OrderServices } from "./order.services";
import { GenericService } from "./base.service";
import AppError from "../../errorHelpers/AppError";


// 1. 🛒 অর্ডার তৈরি
const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { serviceId, quantity } = req.body;
  const clientId = req.user.userId;

  const result = await OrderServices.createOrder(clientId, {
    serviceId,
    quantity,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created successfully. Proceed to payment.",
    data: result,
  });
});

// 2. 📜 সমস্ত অর্ডার আনা (জেনেরিক ফাংশন ব্যবহার করে)
const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  let filter = {};
 

  // রোল অনুযায়ী ফিল্টার সেট করা
  if (userRole === Role.CLIENT) {
    filter = { clientId: userId };
  } else if (userRole === Role.SELLER) {
    filter = { sellerId: userId };
  }

  const result = await OrderServices.getAllOrders(req.query, filter); // কাস্টম সার্ভিস ফাংশন কল

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully.",
    data: result,
  });
});

// 3. 🔍 একক অর্ডার আনা (জেনেরিক ফাংশন ব্যবহার করে)
// src/app/modules/order/order.controller.ts (getSingleOrder ফাংশনের ভেতর)
// ...

// src/app/modules/order/order.controller.ts (getSingleOrder ফাংশনের ভেতর)
// ...

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    
    const loggedInUserId = req.user.userId.toString(); 
    const loggedInUserRole = req.user.role;
    
   

    const result = await GenericService.getSingle(
        Order,
        orderId,
        "serviceId clientId sellerId" // clientId এবং sellerId পপুলেট করা হচ্ছে
    );

    // 💡 চূড়ান্ত FIX: result.clientId টি যদি ObjectId হয় (পপুলেট না হলে)
    // অথবা যদি এটি পপুলেশনের ফলে একটি অবজেক্ট হয় (যা ক্লায়েন্ট অবজেক্ট), 
    // তবে তার _id ব্যবহার করে স্ট্রিং এ রূপান্তর করা হলো।
    
    // clientId কে সঠিকভাবে বের করা: এটি একটি অবজেক্ট হতে পারে, তাই ._id চেক করা হলো।
    let orderClientIdString: string;
    if (result.clientId && typeof result.clientId === 'object' && result.clientId._id) {
        orderClientIdString = result.clientId._id.toString();
    } else {
        orderClientIdString = result.clientId.toString(); // যদি প্লেইন ObjectId থাকে
    }
    
    // sellerId কে সঠিকভাবে বের করা:
    let orderSellerIdString: string;
    if (result.sellerId && typeof result.sellerId === 'object' && result.sellerId._id) {
        orderSellerIdString = result.sellerId._id.toString();
    } else {
        orderSellerIdString = result.sellerId.toString();
    }

    // 🛡️ ইউজার অ্যাক্সেস চেক
  const isClient = orderClientIdString === loggedInUserId;
  const isSeller = orderSellerIdString === loggedInUserId;
  const isAdminOrSuperAdmin =
    loggedInUserRole === "ADMIN" || loggedInUserRole === "SUPER_ADMIN";

  // 💡 FIX: যদি কেউই না হয় (ক্লায়েন্ট, সেলার, অ্যাডমিন/সুপার অ্যাডমিন) তবে এরর থ্রো হবে।
  if (!isClient && !isSeller && !isAdminOrSuperAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to view this order."
    );
  }

    // 4. সফল রেসপন্স
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Order retrieved successfully.",
        data: result,
    });
});


// 4. ⚙️ স্ট্যাটাস আপডেট (কমপ্লেক্স লজিক)
const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { orderStatus, ...updateData } = req.body;
  const userId = req.user.userId;
  const userRole = req.user.role;
  let result;

  // 🎯 রোল এবং স্ট্যাটাস চেকিং
  switch (orderStatus) {
    case OrderStatus.ACCEPTED:
      // শুধুমাত্র সেলার ACCEPT করতে পারবে
      if (userRole !== Role.SELLER) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Only a seller can accept an order."
        );
      }
      result = await OrderServices.acceptOrder(orderId, userId, updateData);
      break;
    case OrderStatus.IN_PROGRESS: // 💡 ADDED: IN_PROGRESS লজিক
      // শুধুমাত্র সেলার IN_PROGRESS করতে পারবে
      if (userRole !== Role.SELLER) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Only a seller can change status to in progress."
        );
      }
      result = await OrderServices.inProgressOrder(orderId, userId);
      break;

    case OrderStatus.DELIVERED:
      // শুধুমাত্র সেলার DELIVER করতে পারবে
      if (userRole !== Role.SELLER) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Only a seller can mark as delivered."
        );
      }
      result = await OrderServices.deliverOrder(orderId, userId, updateData);
      break;

    case OrderStatus.COMPLETED:
      // শুধুমাত্র ক্লায়েন্ট COMPLETE করতে পারবে (এবং ট্রানজাকশন শুরু হবে)
      if (userRole !== Role.CLIENT) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Only the client can complete the order."
        );
      }
      result = await OrderServices.completeOrder(orderId, userId);
      break;

    case OrderStatus.CANCELLED:
      // সেলার বা ক্লায়েন্ট CANCEL করতে পারবে, এখানে রিফান্ড লজিক পরে যুক্ত হবে
      result = await OrderServices.cancelOrder(
        orderId,
        userId,
        userRole,
        updateData
      );
      break;

    default:
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Invalid or unauthorized status update."
      );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Order status updated to ${orderStatus} successfully.`,
    data: result,
  });
});

export const OrderControllers = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
};
