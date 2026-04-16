import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OldEmployee",
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
  { timestamps: true }
);



// 🔥 COMMON CALC FUNCTION (reuse)
const calculateSalary = (data) => {
  const earnings =
    (data.basic || 0) +
    (data.hra || 0) +
    (data.da || 0) +
    (data.specialAllowance || 0) +
    (data.bonus || 0);

  const deductions =
    (data.pf || 0) +
    (data.esi || 0) +
    (data.tax || 0) +
    (data.otherDeduction || 0);

  return {
    gross: earnings,
    net: earnings - deductions,
  };
};



// ✅ CREATE / SAVE HOOK
salarySchema.pre("save", function () {
  const { gross, net } = calculateSalary(this);

  this.gross = gross;
  this.net = net;
});



// ✅ UPDATE HOOK (VERY IMPORTANT)
salarySchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();

  const { gross, net } = calculateSalary(update);

  update.gross = gross;
  update.net = net;
});



export default mongoose.model("Salary", salarySchema);