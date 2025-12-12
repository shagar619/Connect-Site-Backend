/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { MessageServices } from "./message.service";

// Create new message (public)
const createMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const newMessage = await MessageServices.createMessage(payload);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Message submitted successfully",
      data: newMessage,
    });
  }
);

// Get all messages (Admin only)
const getAllMessages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const messages = await MessageServices.getAllMessages();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All messages fetched successfully",
      data: messages,
    });
  }
);

// Delete a message by ID (Admin only)
const deleteMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const messageId = req.params.id;
    await MessageServices.deleteMessage(messageId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Message deleted successfully",
      data: undefined
    });
  }
);

export const MessageControllers = {
  createMessage,
  getAllMessages,
  deleteMessage,
};
