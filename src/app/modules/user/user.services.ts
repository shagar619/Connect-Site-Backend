/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import bcryptjs from "bcryptjs";


import { envVars } from "../../config/env";
import { IUser, Role } from "./user.interface";

import { User } from "./user.model";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";

const createUser = async (payload: any) => {
  const { email, password, role, ...rest } = payload;

  // check existing user
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  // hash password
  const hashedPassword = await bcryptjs.hash(
    password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const userData: any = {
    email,
    password: hashedPassword,
    role,
    name: rest.name,
    address:rest.address || ""
  };

  // ======================================
  // 🔥 ROLE BASED FIELD LOGIC
  // ======================================

  if (role === "SELLER") {
 
    userData.title = rest.title || "";
    userData.bio = rest.bio || "";
    userData.skills = rest.skills || [];
  }

if (role === "CLIENT") {


  // Make sure CLIENT never gets skills/title/bio
  delete userData.skills;
  delete userData.title;
  delete userData.bio;
}


  const newUser = await User.create(userData);

  const userObject: any = newUser.toObject();
  delete userObject.password;

  return userObject;
};






const createAdmin = async (payload: any) => {
  const { email, password, name, profilePicture } = payload;

  const exist = await User.findOne({ email });
  if (exist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Admin already exists");
  }

  const hashedPassword = await bcryptjs.hash(
    password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const admin = await User.create({
    email,
    password: hashedPassword,
    name,
    profilePicture,
    role: Role.ADMIN,
    address: payload.address || "",
    isVerified: true,
    is_active: "ACTIVE",
  });

  const adminObject: any = admin.toObject();
  

  delete adminObject.password;
  delete adminObject.skills; 
  delete adminObject.averageRating; 
  // delete adminObject.location; 
  delete adminObject.bio; 


  return adminObject; 
};





const getAllUsers = async () => {
  const users = await User.find({});
  const totalUsers = await User.countDocuments();

  return {
    data: users,
    meta: { total: totalUsers },
  };
};


const updateUser = async (id: string, payload: Partial<IUser>) => {
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new Error("User not found.");
  }

 


  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.profilePicture && existingUser.profilePicture) {
    await deleteImageFromCLoudinary(existingUser.profilePicture);
  }

  return updatedUser;
};

const getAllAdmins = async () => {
  const admins = await User.find({ role: Role.ADMIN }).select("-password");
  return admins;
};

const deleteAdmin = async (id: string) => {
  const admin = await User.findById(id);

  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  if (admin.role !== Role.ADMIN) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is not an admin");
  }

  await User.findByIdAndDelete(id);

  return { id };
};


const adminUpdateUser = async (id: string, payload: Partial<IUser>) => {
  const existingUser = await User.findById(id);

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // SUPER_ADMIN কে কেউ পরিবর্তন করতে পারবে না
  if (existingUser.role === Role.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "You cannot update a super admin");
  }

  // ROLE Validation: শুধু VALID role পরিবর্তন করা যাবে
  if (payload.role) {
    const validRoles = Object.values(Role);

    if (!validRoles.includes(payload.role)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid role provided");
    }

    // SUPER_ADMIN এ promote করা যাবে না
    if (payload.role === Role.SUPER_ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Cannot promote user to super admin"
      );
    }
  }

  // ACTIVE / INACTIVE / BLOCKED validation
  if (payload.is_active) {
    const validStatus = ["ACTIVE", "INACTIVE", "BLOCKED"];
    if (!validStatus.includes(payload.is_active)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid status provided");
    }
  }

  // Verify / Unverify only boolean
  if (payload.isVerified !== undefined) {
    if (typeof payload.isVerified !== "boolean") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "isVerified must be true or false"
      );
    }
  }

  // Protect password (Admin can't update password)
  if (payload.password) delete payload.password;

  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).select("-password");

  return updatedUser;
};


export const UserServcies = {
  createUser,
  createAdmin,
  getAllUsers,
  updateUser,
  adminUpdateUser,
  getAllAdmins,
  deleteAdmin,


};
