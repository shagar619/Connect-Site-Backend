import { IMessage } from "./message-interface";
import { Message } from "./message.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const createMessage = async (payload: IMessage) => {
  const result = await Message.create(payload);
  return result;
};

const getAllMessages = async () => {
  const messages = await Message.find({}).sort({ createdAt: -1 });
  return messages;
};

const deleteMessage = async (id: string) => {
  const message = await Message.findById(id);
  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, "Message not found");
  }
  await Message.findByIdAndDelete(id);
  return { id };
};

export const MessageServices = {
  createMessage,
  getAllMessages,
  deleteMessage,
};
