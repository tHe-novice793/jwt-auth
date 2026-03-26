import jwt from "jsonwebtoken";
import VerificationCodeType from "../constants/verificationCodeTypes.js";
import SessionModel from "../models/session.model.js";
import UserModel from "../models/user.model.js";
import VerificationCodeModel from "../models/verificationCode.model.js";
import { oneYearFromNow } from "../utils/date.js";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env.js";

// export type CreateAccountParams = {
//   email: string;
//   password: string;
//   userAgent?: string;
// };

import type { z } from "zod";
import { registerSchema } from "../controllers/auth.controller.js";

export type CreateAccountParams = z.infer<typeof registerSchema>;

export const createAccount = async (data: CreateAccountParams) => {
  // Verify existing user doesn't exist
  const existingUser = await UserModel.exists({
    email: data.email,
  });

  if (existingUser) {
    throw new Error("User already existed");
  }
  // Create user
  const user = await UserModel.create({
    email: data.email,
    password: data.password,
  });

  // Create verification code
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  // Send verification email
  // Create session
  //   const sessionData: any = {
  //     userId: user._id,
  //   };

  //   if (data.userAgent !== undefined) {
  //     sessionData.userAgent = data.userAgent;
  //   }

  //   const session = await SessionModel.create(sessionData);

  const sessionData = {
    userId: user._id,
    ...(data.userAgent !== undefined && { userAgent: data.userAgent }),
  };

  const session = await SessionModel.create(sessionData);

  // Sign access token & refresh token
  const refreshToken = jwt.sign(
    { sessionId: session._id },
    JWT_REFRESH_SECRET,
    {
      audience: ["user"],
      expiresIn: "30d",
    },
  );

  const accessToken = jwt.sign(
    { userId: user._id, sessionId: session._id },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    },
  );
  // Return user and tokens
  return {
    user,
    refreshToken,
    accessToken,
  };
};
