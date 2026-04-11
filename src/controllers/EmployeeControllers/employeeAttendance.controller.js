import Attendance from "../../models/Attendance.js";
import Employee from "../../models/employee.model.js";
import { isOfficeIP } from "../../utils/ip.utils.js";
import mongoose from "mongoose";
/* ================= CHECK-IN ================= */
export const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { checkInTime } = req.body; // 🔥 frontend se UTC
  if (!checkInTime) {
      return res.status(400).json({
        message: "checkInTime is required",
      });
    }

    const checkIn = new Date(checkInTime); // ✅ UTC

    // ✅ normalize date (UTC day)
    const date = new Date(Date.UTC(
      checkIn.getUTCFullYear(),
      checkIn.getUTCMonth(),
      checkIn.getUTCDate()
    ));

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date,
    });

    if (attendance?.checkIn) {
      return res.status(400).json({
        message: "Already checked in today",
      });
    }

    if (!attendance) {
      attendance = new Attendance({
        employee: employeeId,
        date,
      });
    }

    attendance.checkIn = checkIn;
    attendance.status = "present";
    attendance.source = "web";

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check-in successful",
      data: attendance,
    });

  } catch (error) {
  console.error("CHECK-IN ERROR 👉", error);

  res.status(500).json({
    message: "Check-in failed",
    error: error.message, // 🔥 add this
  });
}
};

/* ================= CHECK-OUT ================= */
export const checkOut = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { checkOutTime } = req.body;

    if (!checkOutTime) {
      return res.status(400).json({
        message: "checkOutTime is required",
      });
    }

    const checkOut = new Date(checkOutTime); // ✅ UTC

    const date = new Date(Date.UTC(
      checkOut.getUTCFullYear(),
      checkOut.getUTCMonth(),
      checkOut.getUTCDate()
    ));

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date,
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        message: "You have not checked in today",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Already checked out today",
      });
    }

    attendance.checkOut = checkOut;

    // ✅ calculate hours
    const hours =
      (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);

    attendance.totalHours = Number(hours.toFixed(2));

    // ✅ status logic
    if (hours >= 8) attendance.status = "present";
    else if (hours >= 4) attendance.status = "half-day";
    else attendance.status = "absent";

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check-out successful",
      data: attendance,
    });

  } catch (error) {
    console.error("CHECK-OUT ERROR 👉", error);
    res.status(500).json({ message: "Check-out failed" });
  }
};

/* ================= get My Attendance ================= */

export const getMyAttendance = async (req, res) => {
  try {
    const employeeId = req.user.id;

    let { year, month } = req.query;

    const today = new Date();

    year = year ? Number(year) : today.getUTCFullYear();
    month = month ? Number(month) : today.getUTCMonth() + 1;

    // ✅ UTC range (IMPORTANT)
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const attendanceList = await Attendance.find({
      employee: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: -1 });

    const totalWorkingHours = attendanceList.reduce(
      (sum, record) => sum + (record.totalHours || 0),
      0
    );

    res.status(200).json({
      success: true,
      totalDays: attendanceList.length,
      totalWorkingHours: Number(totalWorkingHours.toFixed(2)),
      data: attendanceList,
    });

  } catch (error) {
    console.error("EMPLOYEE ATTENDANCE ERROR 👉", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
};

/* ================= get Employees With Today Attendance ================= */

export const getEmployeesWithTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employees = await Employee.find();

    const attendance = await Attendance.find({
      date: today,
    });

    const result = employees.map((emp) => {
      const todayAttendance = attendance.find(
        (att) => att.employeeId.toString() === emp._id.toString(),
      );

      return {
        ...emp._doc,
        todayStatus: todayAttendance?.status || "Absent",
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= get Employee Attendance ================= */
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const attendance = await Attendance.find({
      employee: employeeId,
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
