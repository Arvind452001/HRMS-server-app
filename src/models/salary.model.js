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

    // ✅ month/year (important)
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

    // 💰 Earnings
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },

    // ➖ Deductions
    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    otherDeduction: { type: Number, default: 0 },

    // 📊 Calculated
    gross: { type: Number, default: 0 },
    net: { type: Number, default: 0 },
  },
  { timestamps: true }
);


// 🔥 Prevent duplicate salary for same employee/month/year
salarySchema.index(
  { employee: 1, month: 1, year: 1 },
  { unique: true }
);


// 🔥 Salary calculation helper
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


// ✅ BEFORE SAVE
salarySchema.pre("save", function (next) {
  const { gross, net } = calculateSalary(this);

  this.gross = gross;
  this.net = net;

  // next();
});


// ✅ BEFORE UPDATE (IMPORTANT FIX)
salarySchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();

  // old doc fetch
  const doc = await this.model.findOne(this.getQuery());

  if (!doc) return;

  const merged = {
    ...doc.toObject(),
    ...update,
  };

  const { gross, net } = calculateSalary(merged);

  this.setUpdate({
    ...update,
    gross,
    net,
  });
});


export default mongoose.model("Salary", salarySchema);