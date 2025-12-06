import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import { User } from "../models/User";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("\n" + "🔐".repeat(40));
    console.log("🔐 JWT VERIFICATION STARTED");

    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      console.log("🔐 Token present:", !!token);
      console.log(
        "🔐 Token (first 20 chars):",
        token?.substring(0, 20) + "..."
      );

      if (!token) {
        console.log("🔐 ❌ No token found!");
        throw new ApiError(401, "Unauthorized request");
      }

      const decodedToken: any = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "secret"
      );

      console.log("🔐 Token decoded successfully. User ID:", decodedToken?._id);

      const user = await User.findById(decodedToken?._id).select("-password");

      if (!user) {
        console.log("🔐 ❌ User not found in database!");
        throw new ApiError(401, "Invalid Access Token");
      }

      console.log("🔐 ✅ User authenticated:", user.email);
      req.user = user;
      console.log("🔐".repeat(40) + "\n");
      next();
    } catch (error: any) {
      console.log("🔐 ❌ JWT Verification failed:", error.message);
      console.log("🔐".repeat(40) + "\n");
      if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Token has expired");
      }
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  }
);
