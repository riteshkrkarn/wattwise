import { Request, Response } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, city } = req.body;
    console.log(`[UserController] Registering user: ${email}`);

    const existedUser = await User.findOne({ email });

    if (existedUser) {
      console.log(`[UserController] User already exists: ${email}`);
      throw new ApiError(409, "User with email already exists");
    }

    console.log(`[UserController] Creating new user record...`);
    const user = await User.create({
      name,
      email,
      password,
      city,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      console.error(
        `[UserController] Failed to retrieve created user document for ID: ${user._id}`
      );
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    // Generate tokens immediately after signup so user is logged in
    const accessToken = user.generateAccessToken();

    console.log(
      `[UserController] User registered successfully: ${createdUser._id}`
    );
    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          { user: createdUser, accessToken },
          "User registered successfully"
        )
      );
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(`[UserController] Logging in user: ${email}`);

  if (!email || !password) {
    throw new ApiError(400, "email and password is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const accessToken = user.generateAccessToken();

  const loggedInUser = await User.findById(user._id).select("-password");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
      },
      "User logged in successfully"
    )
  );
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  // Client is responsible for deleting the token
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, city } = req.body;

    if (!name && !city) {
      throw new ApiError(
        400,
        "At least one field (name or city) is required to update"
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          ...(name && { name }),
          ...(city && { city }),
        },
      },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"));
  }
);

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "User fetched successfully"));
  }
);

export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "currentPassword and newPassword is required");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }

    user.password = newPassword;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Password updated successfully"));
  }
);
