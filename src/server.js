import express from "express";
import visitorRoutes from "./routes/visitor.Routes.js";
import cors from "cors";

import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";


dotenv.config();
const app = express();
const port = 3000;

// 🔥 middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());


connectDB()
// test route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// routes
app.use("/api/visitor", visitorRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/employees", employeeRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/jobs", jobRoutes);
// app.use("/api/candidates", candidateRoutes);
// app.use("/api/applications", applicationRoutes);
// app.use("/api/Interview", InterviewRoutes);
// app.use("/api/offerletter", offerRoutes);

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
