"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
const errorHandler = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError_1.ApiError)) {
        const statusCode = error.statusCode || error instanceof Error ? 400 : 500;
        const message = error.message || "Something went wrong";
        error = new ApiError_1.ApiError(statusCode, message, (error === null || error === void 0 ? void 0 : error.errors) || [], error.stack);
    }
    const response = Object.assign(Object.assign(Object.assign({}, error), { message: error.message }), (process.env.NODE_ENV === "development" ? { stack: error.stack } : {}));
    res.status(error.statusCode).json(response);
};
exports.errorHandler = errorHandler;
