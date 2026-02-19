import cron from "node-cron";
import { autoCheckoutToday } from "../services/attendance.service.js";

cron.schedule("59 23 * * *", async () => {
  await autoCheckoutToday();
  console.log("✅ Auto checkout done");
});
