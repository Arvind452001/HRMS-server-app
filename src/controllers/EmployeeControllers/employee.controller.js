import bcrypt from "bcryptjs";
import Employee from "../../models/Employee.js";

/* ================= REGISTER EMPLOYEE ================= */
export const registerEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      dateOfBirth,
      contactNo,
      personalEmail,
      currentAddress,
      permanentAddress,
      emergencyNo,
    } = req.body;

    const exists = await Employee.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Employee.create({
      name,
      email,
      password: hashedPassword,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      contactNo: contactNo || null,
      personalEmail: personalEmail || null,
      currentAddress: currentAddress || null,
      permanentAddress: permanentAddress || null,
      emergencyNo: emergencyNo || null,
      status: "pending",
      isActive: false,
      emailVerified: false,
    });

    res.status(201).json({
      message: "Registration successful. Waiting for HR approval.",
    });
  } catch {
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ================= GET MY PROFILE ================= */
export const getMyProfile = async (req, res) => {
  const employee = await Employee.findById(req.user.id).select("-password");
  

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  res.json({
    message: "Profile fetched successfully",
    data: employee,
  });
};

/* ================= UPDATE MY PROFILE ================= */
export const updateMyProfile = async (req, res) => {
  const allowedFields = [
    "name",
    "contactNo",
    "currentAddress",
    "permanentAddress",
    "emergencyNo",
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const employee = await Employee.findByIdAndUpdate(
    req.user.userId,
    updateData,
    { new: true }
  ).select("-password");

  res.json({
    message: "Profile updated successfully",
    data: employee,
  });
};
