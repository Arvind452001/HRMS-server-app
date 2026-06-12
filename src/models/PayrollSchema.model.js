import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OldEmployee",
      required: [true, "Employee is required"],
      index: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    // Attendance Snapshot
    workingDays: {
      type: Number,
      default: 0,
    },

    presentDays: {
      type: Number,
      default: 0,
    },

    paidLeaves: {
      type: Number,
      default: 0,
    },

    unpaidLeaves: {
      type: Number,
      default: 0,
    },

    halfDays: {
      type: Number,
      default: 0,
    },

    // Salary Snapshot
    basic: {
      type: Number,
      required: true,
    },

    hra: {
      type: Number,
      default: 0,
    },

    da: {
      type: Number,
      default: 0,
    },

    specialAllowance: {
      type: Number,
      default: 0,
    },

    // Monthly Additions
    bonus: {
      type: Number,
      default: 0,
    },

    overtimeAmount: {
      type: Number,
      default: 0,
    },

    // Deductions
    pf: {
      type: Number,
      default: 0,
    },

    esi: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    otherDeduction: {
      type: Number,
      default: 0,
    },

    leaveDeduction: {
      type: Number,
      default: 0,
    },

    // Final Calculations
    grossSalary: {
      type: Number,
      required: true,
    },

    totalDeduction: {
      type: Number,
      required: true,
    },

    netSalary: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["generated", "paid", "cancelled"],
      default: "generated",
    },

    paidAt: {
      type: Date,
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate payroll generation
payrollSchema.index(
  {
    employee: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;