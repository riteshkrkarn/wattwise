import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("\n" + "❌".repeat(40));
  console.log("❌ ERROR HANDLER CAUGHT AN ERROR!");
  console.log("❌ Error Type:", err.constructor.name);
  console.log("❌ Error Message:", err.message);
  console.log("❌ Status Code:", err.statusCode);
  console.log("❌ Stack:", err.stack);
  console.log("❌".repeat(40) + "\n");

  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof Error ? 400 : 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], error.stack);
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  res.status(error.statusCode).json(response);
};

export { errorHandler };
