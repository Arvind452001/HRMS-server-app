import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { verifyEmailOtpTemplate } from "../utils/emailTemplates/verifyEmailOtp.js";
import Employee from "../models/employee.model.js";

////////------------------LOGIN --------------------//////////

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    const employeeDoc = await Employee.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!employeeDoc) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (
      employeeDoc.status !== "approved" ||
      !employeeDoc.isActive
    ) {
      return res.status(403).json({
        message: "Account not approved or inactive",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      employeeDoc.password
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(employeeDoc);
    const refreshToken = generateRefreshToken(employeeDoc);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Login successful",
        user: {
          id: employeeDoc._id,
          email: employeeDoc.email,
          role: employeeDoc.role,
        },
        accessToken,
      });
  } catch (error) {
    console.error("LOGIN ERROR 👉", error);
    res.status(500).json({ message: "Login failed" });
  }
};

////////------------------CHANGE PASSWORD--------------------//////////

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const employeeDoc = await Employee.findById(
      req.user.userId
    ).select("+password");

    if (!employeeDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(
      oldPassword,
      employeeDoc.password
    );

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Old password incorrect" });
    }

    employeeDoc.password = newPassword; // pre-save hook will hash
    await employeeDoc.save();

    res.json({ message: "Password changed successfully" });
  } catch {
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
    return res
      .status(400)
      .json({ message: "Email already verified" });
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
    return res
      .status(400)
      .json({ message: "Invalid or expired OTP" });
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

  employeeDoc.forgotPasswordExpiry =
    Date.now() + 15 * 60 * 1000;

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
    return res
      .status(400)
      .json({ message: "Invalid or expired token" });
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

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const employeeDoc = await Employee.findById(decoded.id);

    if (!employeeDoc) {
      return res
        .status(401)
        .json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(employeeDoc);

    res.json({ accessToken: newAccessToken });
  } catch {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
};
