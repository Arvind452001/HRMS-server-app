import { ACTIONS, MODULES } from "../../constants/audit.js";
import Salary from "../../models/salary.model.js";
import { createAuditLog } from "../../services/audit.service.js";

/* ================= CREATE ================= */
export const createSalary = async (req, res) => {
  try {
    const salary = await Salary.create(req.body);

    // 🔥 AUDIT
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
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create salary",
    });
  }
};


/* ================= GET ALL ================= */
export const getAllSalary = async (req, res) => {
  try {
    const data = await Salary.find()
      .populate({
        path: "employee",
        select: "personal.fullName professional.employeeId",
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      message: "Salary list fetched successfully",
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
    const salary = await Salary.findById(req.params.id).populate("employee");

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
  console.log("aaaaaaaaa",req.user)
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary not found",
      });
    }

    const oldData = salary.toObject(); // 🔥 before update

    Object.assign(salary, req.body);
    await salary.save(); // pre-save trigger

    // 🔥 AUDIT
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

    await Salary.findByIdAndDelete(req.params.id);

    // 🔥 AUDIT
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