"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.updateUserDetails = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const User_1 = require("../models/User");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const AsyncHandler_1 = require("../utils/AsyncHandler");
exports.registerUser = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, city } = req.body;
    const existedUser = yield User_1.User.findOne({ email });
    if (existedUser) {
        throw new ApiError_1.ApiError(409, "User with email already exists");
    }
    const user = yield User_1.User.create({
        name,
        email,
        password,
        city,
    });
    const createdUser = yield User_1.User.findById(user._id).select("-password");
    if (!createdUser) {
        throw new ApiError_1.ApiError(500, "Something went wrong while registering the user");
    }
    // Generate tokens immediately after signup so user is logged in
    const accessToken = user.generateAccessToken();
    return res
        .status(201)
        .json(new ApiResponse_1.ApiResponse(200, { user: createdUser, accessToken }, "User registered successfully"));
}));
exports.loginUser = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError_1.ApiError(400, "email and password is required");
    }
    const user = yield User_1.User.findOne({ email });
    if (!user) {
        throw new ApiError_1.ApiError(404, "User does not exist");
    }
    const isPasswordValid = yield user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError_1.ApiError(401, "Invalid user credentials");
    }
    const accessToken = user.generateAccessToken();
    const loggedInUser = yield User_1.User.findById(user._id).select("-password");
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {
        user: loggedInUser,
        accessToken,
    }, "User logged in successfully"));
}));
exports.logoutUser = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Client is responsible for deleting the token
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, {}, "User logged out successfully"));
}));
exports.updateUserDetails = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, city } = req.body;
    if (!name && !city) {
        throw new ApiError_1.ApiError(400, "At least one field (name or city) is required to update");
    }
    const user = yield User_1.User.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, {
        $set: Object.assign(Object.assign({}, (name && { name })), (city && { city })),
    }, { new: true }).select("-password");
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, user, "Account details updated successfully"));
}));
exports.getCurrentUser = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, req.user, "User fetched successfully"));
}));
