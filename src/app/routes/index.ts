import { Router } from "express"
import { UserRoutes } from "../modules/user/user.routes"
import { AuthRoutes } from "../modules/auth/auth.route"
import { MessageRoutes } from "../modules/utility-messages/message.route";
import { ServiceRoutes } from "../modules/service/service.routes";
import { OrderRoutes } from "../modules/order/order.routes";
import { TransactionRoutes } from "../modules/transaction/transaction.routes";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { ReviewRoutes } from "../modules/review/review.routes";
import { StateRoute } from "../modules/admin/dashboard.state.route";

export const router = Router()
const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/service",
    route: ServiceRoutes,
  },
  {
    path: "/order",
    route: OrderRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/transaction",
    route: TransactionRoutes,
  },
  {
    path: "/review",
    route: ReviewRoutes,
  },
  {
    path: "/message",
    route: MessageRoutes,
  },
  {
    path: "/state",
    route: StateRoute,
  },
];

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})