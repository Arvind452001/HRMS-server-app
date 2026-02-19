import Attendance from "../models/attendance.model.js";

export const autoCheckoutToday = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendances = await Attendance.find({
    date: today,
    checkIn: { $ne: null },
    checkOut: null,
  });

  for (const att of attendances) {
    att.checkOut = new Date();

    const hours =
      (att.checkOut - att.checkIn) / (1000 * 60 * 60);

    att.totalHours = Number(hours.toFixed(2));
    if (att.totalHours < 4) att.status = "half-day";

    await att.save();
  }
};
