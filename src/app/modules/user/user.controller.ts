/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";

import httpStatus from "http-status-codes";
import { UserServcies } from "./user.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IUser } from "./user.interface";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const user = await UserServcies.createUser(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User created successfully",
      data: user,
    });
  }
);
const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const admin = await UserServcies.createAdmin(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Admin created successfully",
      data: admin,
    });
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user.userId 
    // console.log("upated data..............",req.body);
 
    // console.log(id,"id",req.body);
   const payload: IUser = {
     ...req.body,
     profilePicture: req.file?.path,
   };
   const result = await UserServcies.updateUser(id, payload);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User profile updated successfully",
      data: result,
    });
  }
);



// =================== Admin Updating Other Users ===================
const adminUpdateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const updateData = req.body;

    const result = await UserServcies.adminUpdateUser(userId, updateData);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User updated successfully by admin",
      data: result,
    });
  }
);


const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServcies.getAllUsers();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All users Retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

// GET ALL ADMINS
const getAllAdmins = catchAsync(async (req, res) => {
  const admins = await UserServcies.getAllAdmins();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All admins fetched successfully",
    data: admins,
  });
});


// DELETE ADMIN
const deleteAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await UserServcies.deleteAdmin(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

export const UserControllers = {
  createUser,
  createAdmin,
  updateUser,
  adminUpdateUser,
  getAllUsers,
  getAllAdmins,
  deleteAdmin
};
