import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  checkIn,
  checkOut,
  getMyAttendance,
} from "./../controllers/EmployeeControllers/employeeAttendance.controller.js";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/EmployeeControllers/employee.controller.js";
import {
  applyLeave,
  getMyLeaves,
} from "../controllers/EmployeeControllers/employee.leave.controller.js";

const router = express.Router();

/* ================= PROFILE ================= */
router.get("/getMyProfile", authMiddleware, getMyProfile);
router.put("/updateMyProfile", authMiddleware, updateMyProfile);

router.get("/getMyProfile", authMiddleware, getMyProfile);

/* ================= ATTENDANCE ================= */
router.post("/check-in", authMiddleware, checkIn);
router.post("/check-out", authMiddleware, checkOut);
router.get("/getMyAttendance", authMiddleware, getMyAttendance);

/* ================= LEAVE ================= */
router.get("/leaves", authMiddleware, getMyLeaves);
router.post("/leave/apply", authMiddleware, applyLeave);

export default router;
