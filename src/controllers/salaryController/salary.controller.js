import Salary from "../../models/salary.model.js";
/* ================= CREATE ================= */
export const createSalary = async (req, res) => {
  try {
    const salary = await Salary.create(req.body);

    res.status(201).json({
      success: true,
      data: salary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL ================= */
export const getAllSalary = async (req, res) => {
  try {
    const data = await Salary.find()
      .populate({
  path: "employee",
  select: "personal.fullName professional.employeeId"
})
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET BY ID ================= */
export const getSalaryById = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id).populate("employee");

    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }

    res.json({ success: true, data: salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE ================= */
export const updateSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }

    Object.assign(salary, req.body);

    await salary.save(); // 🔥 important (pre-save trigger)

    res.json({ success: true, data: salary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE ================= */
export const deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);

    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};