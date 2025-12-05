"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const zodError = error;
            const formattedErrors = zodError.issues.map((err) => ({
                field: err.path.join(".").replace("body.", ""),
                message: err.message,
            }));
            // Pass to global error handler
            return next(new ApiError_1.ApiError(400, "Validation failed", formattedErrors));
        }
        return next(new ApiError_1.ApiError(500, "Internal validation error"));
    }
};
exports.validate = validate;
