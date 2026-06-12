import mongoose from "mongoose";

const salaryStructureSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OldEmployee",
      required: [true, "Employee is required"],
      unique: true,
      index: true,
    },

    // Earnings
    basic: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    hra: {
      type: Number,
      min: 0,
      default: 0,
    },

    da: {
      type: Number,
      min: 0,
      default: 0,
    },

    specialAllowance: {
      type: Number,
      min: 0,
      default: 0,
    },

    bonus: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Deductions
    pf: {
      type: Number,
      min: 0,
      default: 0,
    },

    esi: {
      type: Number,
      min: 0,
      default: 0,
    },

    tax: {
      type: Number,
      min: 0,
      default: 0,
    },

    otherDeduction: {
      type: Number,
      min: 0,
      default: 0,
    },

    effectiveFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Gross Salary
salaryStructureSchema.virtual("grossSalary").get(function () {
  return (
    this.basic +
    this.hra +
    this.da +
    this.specialAllowance +
    this.bonus
  );
});

// Virtual Total Deduction
salaryStructureSchema.virtual("totalDeduction").get(function () {
  return (
    this.pf +
    this.esi +
    this.tax +
    this.otherDeduction
  );
});

// Virtual Net Salary
salaryStructureSchema.virtual("netSalary").get(function () {
  return this.grossSalary - this.totalDeduction;
});

const SalaryStructure = mongoose.model(
  "SalaryStructure",
  salaryStructureSchema
);

export default SalaryStructure;