import Leave from "../../models/Leave.js";
/**
 * GET /admin/Leaves/pending
 */
export const getPendingLeaves = async (req, res) => {
  try {
    const Leaves = await Leave.find({ status: "pending" }).populate("employee");
    res.status(200).json({ success: true, data: Leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /admin/Leaves/:id/status
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { LeaveId } = req.params;
    const { status } = req.body;

    const Leave = await Leave.findByIdAndUpdate(
      LeaveId,
      { status },
      { new: true },
    );

    if (!Leave) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    }

    res.status(200).json({
      success: true,
      message: `Leave ${status}`,
      data: Leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
