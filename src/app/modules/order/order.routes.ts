// src/app/modules/order/order.route.ts

import express from "express";

import { Role } from "../user/user.interface";
import {
  createOrderSchema,
  updateOrderStatusSchema,

} from "./order.validation";
import { OrderControllers } from "./order.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequrest";


const router = express.Router();

// 1. 🛒 অর্ডার তৈরি (POST /orders) - ক্লায়েন্ট
router.post(
  "/",
  checkAuth(Role.CLIENT),
  validateRequest(createOrderSchema),
  OrderControllers.createOrder
);

// 2. 📜 সমস্ত অর্ডার আনা (GET /orders) - ক্লায়েন্ট/সেলার/অ্যাডমিন
router.get(
  "/",
  
  checkAuth(...Object.values(Role)),

  OrderControllers.getAllOrders
);

// 4. 🔍 একক অর্ডার আনা (GET /orders/:orderId) - ক্লায়েন্ট/সেলার/অ্যাডমিন
router.get(
  "/:orderId",
  checkAuth(...Object.values(Role)),
  OrderControllers.getSingleOrder
);
// 3. ⚙️ স্ট্যাটাস আপডেট (PATCH /orders/:orderId) - ক্লায়েন্ট/সেলার
router.patch(
  "/:orderId",
  checkAuth(Role.CLIENT, Role.SELLER),
  validateRequest(updateOrderStatusSchema),
  OrderControllers.updateOrderStatus
);


export const OrderRoutes = router;
