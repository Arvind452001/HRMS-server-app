const mongoose = require("mongoose");

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
  }
);

module.exports = mongoose.model(
  "SalaryStructure",
  salaryStructureSchema
);