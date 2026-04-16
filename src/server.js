import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

/* ===== CRON ===== */
import "./cron/autoCheckout.cron.js"; // 🔥 ADD THIS

/* ===== ROUTES ===== */
import visitorRoutes from "./routes/visitor.Routes.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import jobRoutes from "./routes/job.routes.js";
import oldEmployeeRoutes from "./routes/oldEmployee.Routes.js";
import salaryRoutes from "./routes/salary.route.js";

dotenv.config();

const app = express();
const port = 3000;

/* ===== MIDDLEWARE ===== */
app.use(express.json());
app.use(cookieParser());
app.use(cors());

/* ===== DATABASE ===== */
connectDB();

/* ===== TEST ROUTE ===== */
app.get("/", (req, res) => {
  res.send("Hello World!");
});

/* ===== API ROUTES ===== */
app.use("/api/visitor", visitorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/oldEmployees", oldEmployeeRoutes);
app.use("/api/salary", salaryRoutes);

/* ===== SERVER START ===== */
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});