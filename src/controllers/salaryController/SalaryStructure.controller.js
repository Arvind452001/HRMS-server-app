import SalaryStructure from "../../models/salaryStructureSchema.js";

export const createSalaryStructure = async (req, res) => {
  try {
    const {
      employee,
      basic,
      hra,
      da,
      specialAllowance,
      bonus,
      pf,
      esi,
      tax,
      otherDeduction,
      effectiveFrom,
    } = req.body;

    const existingStructure = await SalaryStructure.findOne({
      employee,
    });

    if (existingStructure) {
      return res.status(400).json({
        success: false,
        message: "Salary structure already exists for this employee",
      });
    }

    const salaryStructure = await SalaryStructure.create({
      employee,
      basic,
      hra,
      da,
      specialAllowance,
      bonus,
      pf,
      esi,
      tax,
      otherDeduction,
      effectiveFrom,
    });

    return res.status(201).json({
      success: true,
      data: salaryStructure,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getSalaryStructure = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const salaryStructure = await SalaryStructure.findOne({
      employee: employeeId,
    }).populate("employee");

    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: salaryStructure,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//==================update Salary Structure ==================//
export const updateSalaryStructure = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const salaryStructure =
      await SalaryStructure.findOneAndUpdate(
        { employee: employeeId },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: salaryStructure,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};