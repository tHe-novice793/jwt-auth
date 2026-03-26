import { z } from "zod";
import { catchErrors } from "../utils/catchErrors.js";
import {
  createAccount,
  type CreateAccountParams,
} from "../services/auth.service.js";
import { CREATED } from "../constants/http.js";
import { setAuthCookies } from "../utils/cookies.js";

export const registerSchema = z
  .object({
    email: z.email().min(5).max(255),
    password: z.string().min(6).max(255),
    confirmPassword: z.string().min(6).max(255),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerHandler = catchErrors(async (req, res) => {
  const userAgent = req.headers["user-agent"];

  const request = registerSchema.parse({
    ...req.body,
    ...(typeof userAgent === "string" && { userAgent: userAgent }),
  });

  const { user, accessToken, refreshToken } = await createAccount(request);

  return setAuthCookies({res, accessToken, refreshToken}).status(CREATED).json(user)
});
