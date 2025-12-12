import {  Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequrest";

import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { registerSchema, updateUserSchema } from "./user.validation";
import { multerUpload } from "../../config/multer.config";





const router = Router();


router.post(
  "/register",
  validateRequest(registerSchema),
  UserControllers.createUser
);

router.post(
  "/create-admin",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(registerSchema),
  UserControllers.createAdmin
);

// Get all admins only
router.get(
  "/all-admins",
  checkAuth(Role.SUPER_ADMIN,Role.ADMIN),
  UserControllers.getAllAdmins
);

router.patch(
  "/update-profile",

  checkAuth(...Object.values(Role)),
  multerUpload.single("file"),
  validateRequest(updateUserSchema),
  UserControllers.updateUser
);

// Delete an admin
router.delete(
  "/delete-admin/:id",
  checkAuth(Role.SUPER_ADMIN),
  UserControllers.deleteAdmin
);

router.patch(
  "/admin/update-user/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.adminUpdateUser
);

router.get(
  "/all-users",
  checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
  UserControllers.getAllUsers
);



export const UserRoutes = router