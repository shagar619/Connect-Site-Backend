import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { PaymentControllers } from "./payment.controller";

import cors from "cors";
const router = express.Router();

router.post(
  "/init-payment/:bookingId",
  checkAuth(Role.CLIENT),
  
  PaymentControllers.initPayment
);
router.post(
  "/success",
  cors({ origin: true, credentials: true }),
  PaymentControllers.successPayment
);
router.post(
  "/fail",
  cors({ origin: true, credentials: true }),
  PaymentControllers.failPayment
);
router.post(
  "/cancel",
  cors({ origin: true, credentials: true }),
  PaymentControllers.cancelPayment
);
router.get(
  "/invoice/:paymentId",
  checkAuth(...Object.values(Role)),
  cors({ origin: true, credentials: true }),
  PaymentControllers.getInvoiceDownloadUrl
);
router.post(
  "/validate-payment",
  cors({ origin: true, credentials: true }),
  PaymentControllers.validatePayment
);
export const PaymentRoutes = router;
