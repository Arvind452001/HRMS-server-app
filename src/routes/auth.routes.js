import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validators/employee.schema.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { registerEmployee } from "../controllers/EmployeeControllers/employee.controller.js";
import { changePassword, forgotPassword, login, resetPasswordController, sendEmailOTP, verifyEmailOTP } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerEmployee);
router.post("/login", validate(loginSchema), login);
router.put("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPasswordController);
router.post("/verify-email/send-otp", authMiddleware, sendEmailOTP);
router.post("/verify-email", authMiddleware, verifyEmailOTP);

export default router;
