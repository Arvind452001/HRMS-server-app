import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OldEmployee",
      required: true,
    },

    leaveType: {
      type: String,
      required: true,
    },

    leaveMode: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    emergencyContact: {
      type: String,
      required: true,
    },

    dates: [
      {
        type: Date,
        required: true,
      },
    ],

    // 🔥 NEW FIELDS
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OldEmployee", // manager/admin
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Leave", leaveSchema);