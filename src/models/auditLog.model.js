import mongoose from "mongoose";
// constants/audit.js

export const MODULES = {
  EMPLOYEE: "EMPLOYEE",
  ATTENDANCE: "ATTENDANCE",
  LEAVE: "LEAVE",
  PAYROLL: "PAYROLL",
  SALARY: "SALARY",
  PERFORMANCE: "PERFORMANCE",
  RECRUITMENT: "RECRUITMENT",
  DOCUMENTS: "DOCUMENTS",
};

export const ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  VIEW: "VIEW",
  LOGIN: "LOGIN",
};
const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OldEmployee",
    },

    userName: {
      type: String,
      default: "System",
    },

    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "VIEW", "LOGIN"],
      required: true,
    },

    module: {
      type: String,
      enum: [
        "EMPLOYEE",
        "ATTENDANCE",
        "LEAVE",
        "PAYROLL",
        "SALARY",
        "PERFORMANCE",
        "RECRUITMENT",
        "DOCUMENTS",
      ],
      required: true,
    },

    recordId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    oldData: mongoose.Schema.Types.Mixed,
    newData: mongoose.Schema.Types.Mixed,

    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);