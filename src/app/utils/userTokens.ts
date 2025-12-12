import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { IsActiv, IUser } from "../modules/user/user.interface";

import { generateToken, verifyToken } from "./jwt";
import htttpStatus from "http-status-codes";
import { User } from "../modules/user/user.model";

export const createUserTokens = (user: Partial<IUser>) => {
        const jwtPayload = {
            userId: user._id,
            email: user.email,
            role: user.role,
        }
    
        const accessToken = generateToken(jwtPayload,envVars.JWT_ACCESS_SECRET,envVars.JWT_ACCESS_EXPIRES)
        const refreshToken = generateToken(
          jwtPayload,
          envVars.JWT_REFRESH_SECRET,
          envVars.JWT_REFRESH_EXPIRES
        );
    
    return {
        accessToken,
        refreshToken,
    }
    
}

// export const createNewAccessTokenWithRefreshToken = async(refreshToken: string) => {
//       const verifiedRefreshToken = verifyToken(
//         refreshToken,
//         envVars.JWT_REFRESH_SECRET
//       ) as JwtPayload;

//       const isUserExist = await User.findOne({
//         email: verifiedRefreshToken.email,
//       });
//       if (!isUserExist) {
//         throw new AppError(htttpStatus.BAD_REQUEST, "User does not exist");
//       }
//       if (
//         isUserExist.is_active === IsActiv.BLOCKED ||
//         isUserExist.is_active === IsActiv.INACTIVE
//       ) {
//         throw new AppError(
//           htttpStatus.BAD_REQUEST,
//           `User is ${isUserExist.is_active}`
//         );
//       }

//       const jwtPayload = {
//         userId: isUserExist._id,
//         email: isUserExist.email,
//         role: isUserExist.role,
//       };
//       const accessToken = generateToken(
//         jwtPayload,
//         envVars.JWT_ACCESS_SECRET,
//         envVars.JWT_ACCESS_EXPIRES
//       );
//     return accessToken;
// }


export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const isUserExist = await User.findOne({
    email: verifiedRefreshToken.email,
  });
  if (!isUserExist) {
    throw new AppError(htttpStatus.BAD_REQUEST, "User does not exist");
  }
  if (
    isUserExist.is_active === IsActiv.BLOCKED ||
    isUserExist.is_active === IsActiv.INACTIVE
  ) {
    throw new AppError(
      htttpStatus.BAD_REQUEST,
      `User is ${isUserExist.is_active}`
    );
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };
  //   const accessToken = generateToken(
  //     jwtPayload,
  //     envVars.JWT_ACCESS_SECRET,
  //     envVars.JWT_ACCESS_EXPIRES
  //   );

  // return accessToken;
  // 1. Generate NEW Access Token
  const newAccessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  // 2. Generate NEW Refresh Token (Sliding Session Logic)
  const newRefreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken, // <--- এখন Refresh Token ও ফেরত দেওয়া হচ্ছে
  };
};