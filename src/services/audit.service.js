import AuditLog from "../models/auditLog.model.js";

export const createAuditLog = async ({
  user,
  action,
  module,
  recordId,
  oldData,
  newData,
  req,
}) => {
  try {
    if (oldApplication.status === status) {
  return res.status(400).json({
    success: false,
    message: "Status already set to this value",
  });
}
    await AuditLog.create({
      userId: user?._id,
      userName: user?.name,
      action,
      module,
      recordId,
      oldData,
      newData,
      ipAddress: req.ip,
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
};
