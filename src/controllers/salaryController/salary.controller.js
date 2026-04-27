import { ACTIONS, MODULES } from "../../constants/audit.js";
import Salary from "../../models/salary.model.js";
import { createAuditLog } from "../../services/audit.service.js";

/* ================= CREATE (OR UPDATE SAME MONTH) ================= */
export const createSalary = async (req, res) => {
  console.log("CREATE/UPDATE SALARY 👉", req.body);
  try {
    const { employee, month, year } = req.body;

    if (!employee || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Employee, month and year are required",
      });
    }

    // 🔥 check existing salary
    let existing = await Salary.findOne({ employee, month, year });

    if (existing) {
      // 👉 update instead of duplicate create
      const oldData = existing.toObject();

      Object.assign(existing, req.body);
      await existing.save();

      await createAuditLog({
        user: req.user,
        action: ACTIONS.UPDATE,
        module: MODULES.SALARY,
        recordId: existing._id,
        oldData,
        newData: existing,
        req,
      });

      return res.status(200).json({
        success: true,
        message: "Salary updated (already existed for this month)",
        data: existing,
      });
    }

    // 👉 create new
    const salary = await Salary.create(req.body);

    await createAuditLog({
      user: req.user,
      action: ACTIONS.CREATE,
      module: MODULES.SALARY,
      recordId: salary._id,
      newData: salary,
      req,
    });

    return res.status(201).json({
      success: true,
      message: "Salary created successfully",
      data: salary,
    });

  } catch (error) {
    // 🔥 duplicate safety
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Salary already exists for this employee in this month",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create salary",
    });
  }
};


/* ================= GET ALL (FILTER SUPPORT) ================= */
export const getAllSalary = async (req, res) => {
  try {
    const { month, year, employee } = req.query;

    const filter = {};

    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);
    if (employee) filter.employee = employee;

    const data = await Salary.find(filter)
      .populate({
        path: "employee",
        select: "personal.fullName professional.employeeId",
      })
      .sort({ year: -1, month: -1 });

    return res.json({
      success: true,
      message: "Salary list fetched successfully",
      count: data.length,
      data,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch salary",
    });
  }
};


/* ================= GET BY ID ================= */
export const getSalaryById = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id)
      .populate("employee", "personal.fullName professional.employeeId");

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary not found",
      });
    }

    return res.json({
      success: true,
      message: "Salary fetched successfully",
      data: salary,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch salary",
    });
  }
};


/* ================= UPDATE ================= */
export const updateSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary not found",
      });
    }

    const oldData = salary.toObject();

    Object.assign(salary, req.body);
    await salary.save(); // pre-save triggers

    await createAuditLog({
      user: req.user,
      action: ACTIONS.UPDATE,
      module: MODULES.SALARY,
      recordId: salary._id,
      oldData,
      newData: salary,
      req,
    });

    return res.json({
      success: true,
      message: "Salary updated successfully",
      data: salary,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate salary for this month",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update salary",
    });
  }
};


/* ================= DELETE ================= */
export const deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary not found",
      });
    }

    const oldData = salary.toObject();

    await salary.deleteOne();

    await createAuditLog({
      user: req.user,
      action: ACTIONS.DELETE,
      module: MODULES.SALARY,
      recordId: req.params.id,
      oldData,
      req,
    });

    return res.json({
      success: true,
      message: "Salary deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete salary",
    });
  }
};


/* ================= GET MY SALARY ================= */
export const getMySalary = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const salaries = await Salary.find({ employee: employeeId })
      .sort({ year: -1, month: -1 });

    return res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};