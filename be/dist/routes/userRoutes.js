"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const validateResource_1 = require("../middlewares/validateResource");
const userSchema_1 = require("../schema/userSchema");
const verifyJWT_1 = require("../middlewares/verifyJWT");
const router = (0, express_1.Router)();
router.post("/signup", (0, validateResource_1.validate)(userSchema_1.signupSchema), UserController_1.registerUser);
router.post("/login", (0, validateResource_1.validate)(userSchema_1.loginSchema), UserController_1.loginUser);
// Protected Routes
router.post("/logout", verifyJWT_1.verifyJWT, UserController_1.logoutUser);
router.patch("/update-details", verifyJWT_1.verifyJWT, (0, validateResource_1.validate)(userSchema_1.updateUserSchema), UserController_1.updateUserDetails);
router.get("/me", verifyJWT_1.verifyJWT, UserController_1.getCurrentUser);
exports.default = router;
