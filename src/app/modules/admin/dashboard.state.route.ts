import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { AdminController } from "./dashboard.state.controller";


const router = Router();


router.get(
  "/dashboard",
  checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
  AdminController.getDashboardStats
);


export const StateRoute = router;
