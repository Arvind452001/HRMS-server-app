import Leave from "../../models/leave.js";

/**
 * GET /admin/leaves/pending
 */
export const getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "pending" }).populate("employee");
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /admin/leaves/:id/status
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true },
    );

    if (!leave) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    }

    res.status(200).json({
      success: true,
      message: `Leave ${status}`,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
