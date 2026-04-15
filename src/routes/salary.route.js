import express from "express";
import { createSalary, deleteSalary, getAllSalary, getSalaryById, updateSalary } from "../controllers/salaryController/salary.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add-Salary", authMiddleware,createSalary);
router.get("/getAllSalary",authMiddleware, getAllSalary);
router.get("/getSalaryById/:id",authMiddleware, getSalaryById);
router.patch("/updateSalary/:id",authMiddleware, updateSalary);
router.delete("/deleteSalary/:id",authMiddleware, deleteSalary);

export default router;