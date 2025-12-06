import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Name is required" })
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email address"),
    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    city: z.string({ message: "City is required" }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email address"),
    password: z.string({ message: "Password is required" }),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    city: z.string().optional(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ message: "Current password is required" }),
    newPassword: z.string({ message: "New password is required" }),
  }),
});
