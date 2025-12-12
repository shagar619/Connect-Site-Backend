/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unused-vars */
import AppError from "../../errorHelpers/AppError";

import htttpStatus from "http-status-codes";

import bcryptjs from "bcryptjs";

import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import { envVars } from "../../config/env";

import { JwtPayload } from "jsonwebtoken";
import { IsActiv, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { generateToken, verifyToken } from "../../utils/jwt";
import { emailSender } from "../../utils/sendEmail";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email }).select("+password");
  if (!isUserExist) {
    throw new AppError(htttpStatus.BAD_REQUEST, "User does not exist");
  }

  // 🚫 BLOCKED / INACTIVE user cannot login
  if (
    isUserExist.is_active === IsActiv.BLOCKED ||
    isUserExist.is_active === IsActiv.INACTIVE
  ) {
    throw new AppError(
      htttpStatus.FORBIDDEN,
      `Your account is ${isUserExist.is_active}`
    );
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(htttpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  const userObject: any = isUserExist.toObject(); // any হিসাবে ডিক্লেয়ার করা হয়েছে

  // 💡 FIX: রোল অনুযায়ী অপ্রয়োজনীয় ফিল্ড বাদ দেওয়া
  if (userObject.role === "ADMIN" || userObject.role === "SUPER_ADMIN") {
    delete userObject.skills;
    delete userObject.averageRating;

    delete userObject.bio;
    delete userObject.title;
  }
  // CLIENT দের জন্য অপ্রয়োজনীয় ফিল্ড বাদ
  if (userObject.role === "CLIENT") {
    delete userObject.skills;
    delete userObject.averageRating;
    delete userObject.title;
    delete userObject.bio;
  }

  // ✅ নতুন লজিক: CLIENT/SELLER দের জন্য অনুপস্থিত প্রোফাইল ফিল্ড যুক্ত করা
  if (userObject.role !== "ADMIN" && userObject.role !== "SUPER_ADMIN") {
    if (typeof userObject.address === "undefined") {
      userObject.address = "";
    }
    if (typeof userObject.title === "undefined") {
      userObject.title = ""; // নতুন ফিল্ড
    }
    if (typeof userObject.bio === "undefined") {
      userObject.bio = "";
    }
    // প্রয়োজনে অন্যান্য প্রোফাইল ফিল্ড (যেমন location) এখানে যুক্ত করা যেতে পারে
  }

  // এখন শুধু password এবং __v বাদ দিয়ে বাকিটা rest এ রাখব
  const { password: pass, __v, ...rest } = userObject; // rest object is sanitized

  const userTokens = createUserTokens(rest);

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest, // rest এ এখন অ্যাডমিনদের জন্য পরিষ্কার ডেটা থাকবে
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const newTokens = await createNewAccessTokenWithRefreshToken(refreshToken);
  return newTokens;
};


const getMe = async (decodedToken: JwtPayload) => {
  // এখানে আপনি JWT পেলোডটি পাচ্ছেন, টোকেন আবার ডিকোড করার দরকার নেই

  const userData = await User.findOne({
    email: decodedToken.email, // JWT থেকে ইমেল ব্যবহার করে ইউজার খুঁজুন
    // status: UserStatus.ACTIVE, // যদি UserStatus.ACTIVE আপনার ইউজার মডেলে না থাকে তবে এটি সরিয়ে দিন
  }).select("-password"); // পাসওয়ার্ড বাদ দিয়ে বাকি সব ডেটা আনুন

  if (!userData) {
    throw new AppError(htttpStatus.NOT_FOUND, "User not found or is inactive.");
  }

  // ✅ গুরুত্বপূর্ণ: toObject() ব্যবহার করে Mongoose ডকুমেন্টকে প্লেন JS অবজেক্টে রূপান্তর করুন
  const userObject: any = userData.toObject(); // any হিসাবে ডিক্লেয়ার করা হয়েছে যাতে পরে ডিলিট করা যায়

  // 💡 সংশোধন: রোল অনুযায়ী অপ্রয়োজনীয় ফিল্ড বাদ দেওয়া
  if (userObject.role === "ADMIN" || userObject.role === "SUPER_ADMIN") {
    // অ্যাডমিনদের জন্য অপ্রয়োজনীয় ফিল্ড বাদ দেওয়া
    delete userObject.skills;
    delete userObject.averageRating;
   
    delete userObject.bio;
    delete userObject.title;
  }

  // CLIENT দের জন্য অপ্রয়োজনীয় ফিল্ড বাদ
  if (userObject.role === "CLIENT") {
    delete userObject.skills;
    delete userObject.averageRating;
    delete userObject.title;
    delete userObject.bio;
  
  }

  // ✅ নতুন লজিক: CLIENT/SELLER দের জন্য অনুপস্থিত প্রোফাইল ফিল্ড যুক্ত করা
  
    if (typeof userObject.address === "undefined") {
      userObject.address = "";
    }
    if (typeof userObject.title === "undefined") {
      userObject.title = ""; // নতুন ফিল্ড
    }
    if (typeof userObject.bio === "undefined") {
      userObject.bio = "";
    }
    // প্রয়োজনে অন্যান্য প্রোফাইল ফিল্ড (যেমন location) এখানে যুক্ত করা যেতে পারে
  

  // Mongoose ভার্সন কী বাদ দেওয়া (সব রোলের জন্য)
  delete userObject.__v;

  // ফ্রন্টএন্ডের সুবিধার জন্য password এবং __v ছাড়া পুরো ইউজার অবজেক্টটি রিটার্ন করুন
  return userObject;
};




const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId).select("+password");
  if (!user) throw new AppError(htttpStatus.NOT_FOUND, "User not found");

  const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user.password);
  if (!isOldPasswordMatch) {
    throw new AppError(htttpStatus.UNAUTHORIZED, "Old password does not match");
  }

  user.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );
  await user.save(); // await added
};

export const forgotPassword = async (payload: { email: string }) => {
  const userData = await User.findOne({
    email: payload.email,
  }).lean();

  if (!userData) {
    throw new AppError(htttpStatus.NOT_FOUND, "User not found!");
  }

  const resetPassToken = generateToken(
    {
      userId: userData._id,
    },
    envVars.RESET_PASS_TOKEN_SECRET ,
    envVars.RESET_PASS_TOKEN_EXPIRES as string
  );

  // const resetPassLink = envVars.FRONTEND_URL + `?token=${resetPassToken}`;
  const resetPassLink = `${envVars.FRONTEND_URL}/reset-password?token=${resetPassToken}`;

 await emailSender(
   userData.email,
   `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Dear User,</p>

      <p>
        You requested a password reset. Click the button below to reset your password:
      </p>

      <p>
        <a href="${resetPassLink}" style="text-decoration: none;">
          <button style="
            padding: 10px 20px; 
            background-color: #007bff; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
          ">
            Reset Password
          </button>
        </a>
      </p>

      <p>If you did not request this, please ignore this email.</p>
    </div>
  `
 );



};

export const resetPassword = async (token: string, password: string) => {

  const { userId } = verifyToken(
    token,
    envVars.RESET_PASS_TOKEN_SECRET
  ) as JwtPayload as {
    userId: string;
  };

  const user = await User.findById(userId);

  if (!user) throw new AppError(htttpStatus.BAD_REQUEST, "User not found!");

  const hasPassword = bcryptjs.hashSync(password, bcryptjs.genSaltSync(10));

  await User.findByIdAndUpdate(
    userId,
    { password: hasPassword },
    { runValidators: true }
  );
};

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
};
