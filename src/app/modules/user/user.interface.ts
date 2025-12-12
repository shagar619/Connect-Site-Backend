import {  Types } from "mongoose";

// Role এনুম (Enum) নির্ধারণ
export enum Role {
  ADMIN = "ADMIN",
  SUPER_ADMIN="SUPER_ADMIN",
  CLIENT = "CLIENT",
  SELLER = "SELLER",
}

export enum IsActiv {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  _id?: Types.ObjectId;

  name: string;
  email: string;
  password?: string;
  role: Role;
  title?: string;

  isVerified: boolean;
  is_active: IsActiv;

  // Profile details
  address?: string;
  bio?: string;
  skills?: string[];
  profilePicture?: string;
  averageRating?: number;
  contactNumber?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
