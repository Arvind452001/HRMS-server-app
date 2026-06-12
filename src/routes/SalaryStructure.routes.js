import express from "express";
import {
  createSalaryStructure,
  getSalaryStructure,
  updateSalaryStructure,
} from "../controllers/salaryController/SalaryStructure.controller.js";

const router = express.Router();

router.post("/create", createSalaryStructure);

router.get("/get/:employeeId", getSalaryStructure);

router.put("/update/:employeeId", updateSalaryStructure);

export default router;