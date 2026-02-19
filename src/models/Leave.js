import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    dates: {
      type: [Date], // 🔥 MULTIPLE DATES
      required: true,
      validate: [
        (v) => Array.isArray(v) && v.length > 0,
        "At least one leave date is required",
      ],
    },

    leaveType: {
      type: String,
      enum: ["casual", "sick", "paid"],
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Leave", leaveSchema);
