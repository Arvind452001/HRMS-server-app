import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Employee from "../src/models/employee.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // connect DB
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await Employee.findOne({
      email: "admin.company@gmail.com",
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@#123", 10);

    await Employee.create({
      name: "System Admin",
      email: "admin.company@gmail.com",
      password: hashedPassword,
      role: "admin",
      status: "approved",
      isActive: true,
      emailVerified: true,
    });

    console.log("✅ Admin created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Admin seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
