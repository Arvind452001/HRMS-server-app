import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OldEmployee", // 👈 yaha correct model name
      required: true,
    },
    salaryType: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    effectiveFrom: {
      type: Date,
      required: true,
    },
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },

    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    otherDeduction: { type: Number, default: 0 },

    gross: { type: Number, default: 0 },
    net: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// 🔥 FIXED
// salarySchema.pre("save", function (next) {
//   const earnings =
//     (this.basic || 0) +
//     (this.hra || 0) +
//     (this.da || 0) +
//     (this.specialAllowance || 0) +
//     (this.bonus || 0);

//   const deductions =
//     (this.pf || 0) +
//     (this.esi || 0) +
//     (this.tax || 0) +
//     (this.otherDeduction || 0);

//   this.gross = earnings;
//   this.net = earnings - deductions;

//   next();
// });

export default mongoose.model("Salary", salarySchema);
