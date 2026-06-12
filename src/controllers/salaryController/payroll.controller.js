// controllers/payroll.controller.js

import Attendance from "../../models/Attendance.js";
import PayrollSchemaModel from "../../models/PayrollSchema.model.js";
import SalaryStructure from "../../models/salaryStructureSchema.js";
import { calculateSalary } from "../../services/SalaryCalculation.Service.js";

export const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    console.log("employeeId:", employeeId);
    const salaryStructure = await SalaryStructure.findOne({
      employee: employeeId,
    });
    console.log("Salary Structure:", salaryStructure);
    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found",
      });
    }

    const attendanceRecords = await Attendance.find({
      employeeId,
      month,
      year,
    });

    const workingDays = attendanceRecords.length;

    const presentDays = attendanceRecords.filter(
      (a) => a.status === "present",
    ).length;

    const paidLeaves = attendanceRecords.filter(
      (a) => a.status === "paid_leave",
    ).length;

    const unpaidLeaves = attendanceRecords.filter(
      (a) => a.status === "unpaid_leave",
    ).length;

    const halfDays = attendanceRecords.filter(
      (a) => a.status === "half_day",
    ).length;

    const grossSalary =
      salaryStructure.basicSalary +
      salaryStructure.hra +
      salaryStructure.allowance;

    const payrollData = calculateSalary({
      grossSalary,
      workingDays,
      presentDays,
      paidLeaves,
      unpaidLeaves,
      halfDays,
      otherDeductions: salaryStructure.otherDeductions || 0,
    });

    const payroll = await PayrollSchemaModel.create({
      employeeId,
      month,
      year,
      ...payrollData,
    });

    return res.status(201).json({
      success: true,
      payroll,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
