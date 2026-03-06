import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    userName: String,
    action: String,
    module: String,
    recordId: mongoose.Schema.Types.ObjectId,
    oldData: Object,
    newData: Object,
    ipAddress: String
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;