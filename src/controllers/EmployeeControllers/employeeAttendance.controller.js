import Attendance from "../../models/Attendance.js";
import { isOfficeIP } from "../../utils/ip.utils.js";

/* ================= CHECK-IN ================= */
export const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;

    // const clientIP =
    //   req.headers["x-forwarded-for"]?.split(",")[0] ||
    //   req.socket.remoteAddress;

    // if (!isOfficeIP(clientIP)) {
    //   return res.status(403).json({
    //     message: "Check-in allowed only from office network",
    //   });
    // }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    // ❌ already checked in
    if (attendance?.checkIn) {
      return res.status(400).json({
        message: "Already checked in today",
      });
    }

    // ✅ create if not exists
    if (!attendance) {
      attendance = new Attendance({
        employee: employeeId,
        date: today,
      });
    }

    // 🔥 force set
    attendance.employee = employeeId;
    attendance.date = today;
    attendance.checkIn = new Date();
    attendance.status = "present";
    attendance.source = "web";

    await attendance.save();

    res.status(200).json({
      message: "Check-in successful",
      checkIn: attendance.checkIn,
    });
  } catch (error) {
    console.error("CHECK-IN ERROR 👉", error);
    res.status(500).json({ message: "Check-in failed" });
  }
};

/* ================= CHECK-OUT ================= */
export const checkOut = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const clientIP =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    if (!isOfficeIP(clientIP)) {
      return res.status(403).json({
        message: "Check-out allowed only from office network",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
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

    attendance.checkOut = new Date();

    const hours =
      (attendance.checkOut - attendance.checkIn) /
      (1000 * 60 * 60);

    attendance.totalHours = Number(hours.toFixed(2));

    // 🔥 simple rule
    attendance.status =
      attendance.totalHours < 4 ? "half-day" : "present";

    await attendance.save();

    res.status(200).json({
      message: "Check-out successful",
      checkOut: attendance.checkOut,
      totalHours: attendance.totalHours,
      status: attendance.status,
    });
  } catch (error) {
    console.error("CHECK-OUT ERROR 👉", error);
    res.status(500).json({ message: "Check-out failed" });
  }
};


/* ================= get My Attendance ================= */

export const getMyAttendance = async (req, res) => {
  // console.log("aaaaaaaaaaaaa")
  try {
    const employeeId = req.user.id;

    const attendanceList = await Attendance.find({
      employee: employeeId,
    }).sort({ date: -1 });

    const totalWorkingHours = attendanceList.reduce(
      (sum, record) => sum + (record.totalHours || 0),
      0
    );

    res.status(200).json({
      totalDays: attendanceList.length,
      totalWorkingHours: Number(totalWorkingHours.toFixed(2)),
      data: attendanceList,
    });
  } catch (error) {
    console.error("EMPLOYEE ATTENDANCE ERROR 👉", error);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};
