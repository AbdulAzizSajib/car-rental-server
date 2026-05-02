/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";

import { CookieUtils } from "../utils/cookie";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { UserRole } from "../../generated/prisma/enums";

export const checkAuth =
  (...authRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawToken = CookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      if (!rawToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No session token provided.",
        );
      }

      // BetterAuth stores only the part before the "." in the session table
      const sessionToken = rawToken.includes(".")
        ? (rawToken.split(".")[0] as string)
        : rawToken;

      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: { user: true },
      });

      if (!session || session.expiresAt <= new Date()) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid or expired session.",
        );
      }

      const userRole = session.user.role as UserRole;

      if (authRoles.length > 0 && !authRoles.includes(userRole)) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource.",
        );
      }

      req.user = {
        userId: session.user.id,
        email: session.user.email,
        role: userRole,
      };

      return next();
    } catch (error: any) {
      next(error);
    }
  };
