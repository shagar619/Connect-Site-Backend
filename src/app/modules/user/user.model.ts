// src/models/User.model.js

import mongoose from "mongoose";
import { IsActiv, Role } from "./user.interface";





const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: Role,
      default: "CLIENT",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: String,
      enum: Object.values(IsActiv),
      default: IsActiv.ACTIVE,
      required: true,
    },

    // seller–specific fields
    address: {
      type: String,
      trim: true,
      default: undefined,
    },
    bio: {
      type: String,
      trim: true,
      default: undefined,
    },
    title: {
      type: String,
      trim: true,
      default: undefined,
    },
    skills: {
      type: [String],
      default: undefined,
    },

    profilePicture: {
      type: String,
      default: "",
    },
    averageRating: {
      type: Number,
      default: function () {
        // শুধুমাত্র SELLER-এর জন্য 0, অন্যদের undefined
        return this.role === "SELLER" ? 0 : undefined;
      },
    },

    contactNumber: {
      type: String,
      trim: true,
      default: "",
      match: [/^\+?[0-9]{7,15}$/, "Invalid contactNumber number"],
    },
  },
  { timestamps: true }
);


// ভবিষ্যতে পাসওয়ার্ড হ্যাশিং (Hashing) এখানে যুক্ত করা হবে

export const User = mongoose.model("User", userSchema);


