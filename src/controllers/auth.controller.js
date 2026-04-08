import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { verifyEmailOtpTemplate } from "../utils/emailTemplates/verifyEmailOtp.js";
import Employee from "../models/employee.model.js";
import OldEmployee from "../models/oldEmployee.model.js";

////////------------------LOGIN --------------------//////////

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

    // 🔥 FIND BY OFFICIAL EMAIL
    const employeeDoc = await OldEmployee.findOne({
      "account.officialEmail": normalizedEmail,
    });
   if (!employeeDoc) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔥 CHECK STATUS (OPTIONAL BUT GOOD)
    if (employeeDoc.professional?.status !== "Active") {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    // 🔥 PASSWORD MATCH (HASH COMPARE)
    const isMatch = await bcrypt.compare(
      password,
      employeeDoc.account?.loginPassword,
    );
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔥 TOKEN (OPTIONAL - if you already have functions)
    const accessToken = generateAccessToken(employeeDoc);
    const refreshToken = generateRefreshToken(employeeDoc);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // production me true
        sameSite: "strict",
      })
      .status(200)
      .json({
        message: "Login successful",
        user: {
          id: employeeDoc._id,
          name: employeeDoc.personal?.fullName,
          email: employeeDoc.account?.officialEmail,
          employeeId: employeeDoc.professional?.employeeId,
          role: employeeDoc.role, // ✅ ADD THIS
        },
        accessToken,
      });
  } catch (error) {
    console.error("LOGIN ERROR 👉", error);
    res.status(500).json({ message: "Login failed" });
  }
};

//============================ GET MY PROFILE ============================//
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
console.log("GET PROFILE USER ID 👉", userId);
    const employee = await OldEmployee.findById(userId).select(
      "-account.loginPassword -account.officialPassword"
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });

  } catch (error) {
    console.error("GET PROFILE ERROR 👉", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

////////------------------CHANGE PASSWORD--------------------//////////
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const employeeDoc = await OldEmployee.findById(req.user.userId);

    if (!employeeDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 GET CURRENT HASHED PASSWORD
    const currentPassword = employeeDoc.account?.loginPassword;

    if (!currentPassword) {
      return res.status(400).json({ message: "Password not set" });
    }

    // 🔥 MATCH OLD PASSWORD
    const isMatch = await bcrypt.compare(oldPassword, currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    // 🔥 HASH NEW PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🔥 UPDATE PASSWORD
    employeeDoc.account.loginPassword = hashedPassword;

    await employeeDoc.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR 👉", error);
    res.status(500).json({ message: "Password change failed" });
  }
};

////////------------------SEND EMAIL OTP--------------------//////////

export const sendEmailOTP = async (req, res) => {
  const employeeDoc = await Employee.findById(req.user.userId);

  if (!employeeDoc) {
    return res.status(404).json({ message: "User not found" });
  }

  if (employeeDoc.emailVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  employeeDoc.emailOTP = otp;
  employeeDoc.emailOTPExpiry = Date.now() + 10 * 60 * 1000;

  await employeeDoc.save();

  await sendEmail({
    to: employeeDoc.email,
    subject: "Verify your email",
    html: verifyEmailOtpTemplate(otp),
  });

  res.json({ message: "OTP sent to email" });
};

////////------------------VERIFY EMAIL OTP--------------------//////////

export const verifyEmailOTP = async (req, res) => {
  const { otp } = req.body;

  const employeeDoc = await Employee.findById(req.user.userId);

  if (!employeeDoc) {
    return res.status(404).json({ message: "User not found" });
  }

  if (
    employeeDoc.emailOTP !== Number(otp) ||
    employeeDoc.emailOTPExpiry < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  employeeDoc.emailVerified = true;
  employeeDoc.emailOTP = null;
  employeeDoc.emailOTPExpiry = null;

  await employeeDoc.save();

  res.json({ message: "Email verified successfully" });
};

////////------------------FORGOT PASSWORD--------------------//////////

export const forgotPassword = async (req, res) => {
  const employeeDoc = await Employee.findOne({
    email: req.body.email,
  });

  if (!employeeDoc) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  employeeDoc.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  employeeDoc.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

  await employeeDoc.save();

  res.json({ message: "Password reset link sent" });
};

////////------------------RESET PASSWORD--------------------//////////

export const resetPasswordController = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const employeeDoc = await Employee.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!employeeDoc) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  employeeDoc.password = req.body.newPassword; // pre-save hook will hash
  employeeDoc.forgotPasswordToken = null;
  employeeDoc.forgotPasswordExpiry = null;

  await employeeDoc.save();

  res.json({ message: "Password reset successful" });
};

////////------------------REFRESH ACCESS TOKEN--------------------//////////

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const employeeDoc = await Employee.findById(decoded.id);

    if (!employeeDoc) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(employeeDoc);

    res.json({ accessToken: newAccessToken });
  } catch {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
};
