import { Router } from "express";
import { MessageControllers } from "./message.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";



const router = Router();

router.post(
  "/create-message",
 
MessageControllers.createMessage
);

// Admin-only routes
router.get("/all", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), MessageControllers.getAllMessages);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), MessageControllers.deleteMessage);



export const MessageRoutes = router;
