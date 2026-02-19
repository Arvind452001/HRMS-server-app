import Employee from "../../models/Employee.js";

// GET /admin/Employees
export const getAllEmployees = async (req, res) => {
  try {
    const { status, active } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (active !== undefined) filter.isActive = active === "true";

    const Employees = await Employee.find(filter).select("-password");

    res.status(200).json({
      success: true,
      data: Employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /admin/employees/:id
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /admin/Employees/:id
// PUT /admin/employees/:id
export const updateEmployeeByAdmin = async (req, res) => {
  try {
    const updateData = req.body;

    // 🚫 Prevent sensitive fields update
    delete updateData.password;
    delete updateData.role;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update",
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    ).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /admin/Employees/:id/active
export const toggleEmployeeActiveStatus = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    res.status(200).json({
      success: true,
      message: employee.isActive
        ? "Employee activated"
        : "Employee deactivated",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
