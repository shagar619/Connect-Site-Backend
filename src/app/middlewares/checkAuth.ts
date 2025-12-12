import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import AppError from "../errorHelpers/AppError";
import httpStaut from "http-status-codes";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";

import { IsActiv } from "../modules/user/user.interface";
import htttpStatus from "http-status-codes";
import { User } from "../modules/user/user.model";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken =
        req.cookies["accessToken"] || req.headers.authorization;
      if (!accessToken) {
        throw new AppError(httpStaut.UNAUTHORIZED, "No token provided");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExist = await User.findOne({
        email: verifiedToken.email,
      });
      if (!isUserExist) {
        throw new AppError(htttpStatus.BAD_REQUEST, "User does not exist");
      }
      // 🚫 BLOCKED / INACTIVE user detect
      if (
        isUserExist.is_active === IsActiv.BLOCKED ||
        isUserExist.is_active === IsActiv.INACTIVE
      ) {
        // 🔥 Force logout
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        throw new AppError(
          htttpStatus.UNAUTHORIZED,
          `Your account is ${isUserExist.is_active}. You have been logged out.`
        );
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          httpStaut.FORBIDDEN,
          "You are not allowed to access this resource"
        );
      }

      req.user = verifiedToken;

      next();
    } catch (error) {
      next(error);
    }
  };
