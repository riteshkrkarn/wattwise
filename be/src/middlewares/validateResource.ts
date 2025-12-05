import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = error as ZodError;
        const formattedErrors = zodError.issues.map((err: any) => ({
          field: err.path.join(".").replace("body.", ""),
          message: err.message,
        }));
        // Pass to global error handler
        return next(new ApiError(400, "Validation failed", formattedErrors));
      }
      return next(new ApiError(500, "Internal validation error"));
    }
  };
