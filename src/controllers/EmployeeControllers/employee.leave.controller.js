import Leave from "../../models/leave.js";

/**
 * POST /employee/leave/apply
 */
export const applyLeave = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { dates, leaveType, reason } = req.body;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one leave date",
      });
    }

    // 🔥 OVERLAP CHECK
    const existingLeave = await Leave.findOne({
      employee: req.user.id,
      status: { $in: ["pending", "approved"] },
      dates: { $in: dates }, // 👈 date overlap check
    });

    if (existingLeave) {
      return res.status(409).json({
        success: false,
        message: "Leave already applied for one or more selected dates",
      });
    }

    // ✅ CREATE LEAVE
    const leave = await Leave.create({
      employee: req.user.id,
      dates,
      leaveType,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      data: leave,
    });
  } catch (error) {
    console.error("APPLY LEAVE ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




/**
 * GET /employee/leaves
 */
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
