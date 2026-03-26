import type { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date.js";

const secure = process.env.NODE_ENV !== "development";

const defaults: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
  secure,
};

const getAccessTokenOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

const getRefreshTokenOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  path: "/auth/refresh",
});

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) =>
  res
    .cookie("accessToken", accessToken, getAccessTokenOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenOptions());
