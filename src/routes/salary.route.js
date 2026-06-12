import express from "express";
import { createSalary, deleteSalary, getAllSalary, getMySalary, getSalaryById, updateSalary } from "../controllers/salaryController/salary.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { isHrOrAdmin } from "../middlewares/role.middleware.js";
import { generatePayroll } from "../controllers/salaryController/payroll.controller.js";

const router = express.Router();

//==================Employee SALARY ==================//
router.post("/add-Salary",  createSalary);
router.get("/getAllSalary",authMiddleware, isHrOrAdmin, getAllSalary);
router.get("/getSalaryById/:id",authMiddleware, isHrOrAdmin, getSalaryById);
router.patch("/updateSalary/:id",authMiddleware, isHrOrAdmin, updateSalary);
router.delete("/deleteSalary/:id",authMiddleware, isHrOrAdmin, deleteSalary);
//==================Payroll Generation ==================//
router.post("/generate", generatePayroll);

//==================Employee SALARY ==================//
router.get("/getMySalary",authMiddleware, getMySalary);

export default router;