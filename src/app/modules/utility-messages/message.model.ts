// src/models/Message.model.js
import mongoose from "mongoose";
import { IssueType } from "./message-interface";

const messageSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2 },
    lastName: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, trim: true, lowercase: true },
    contactNumber: { type: String, default: null },
    issueType: {
      type: String,
      required: true,
      enum: Object.values(IssueType),
      default: IssueType.GENERAL,
    },
    message: { type: String, required: true, minlength: 10 },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
