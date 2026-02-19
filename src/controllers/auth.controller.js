import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { verifyEmailOtpTemplate } from "../utils/emailTemplates/verifyEmailOtp.js";
import Employee from "../models/Employee.js";


////////------------------LOGIN --------------------//////////

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // console.log("login", req.body);

    // 🔒 normalize email
    const normalizedEmail = email.toLowerCase();

    const user = await Employee.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔒 Only HR or Admin can login
    // if (!["hr", "admin"].includes(user.role)) {
    //   return res.status(403).json({
    //     message: "Access denied. HR or Admin only.",
    //   });
    // }

    // 🔒 Must be approved & active
    if (user.status !== "approved" || !user.isActive) {
      return res.status(403).json({
        message: "Account not approved or inactive",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 🍪 Store refresh token in HTTP-only cookie
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true, // JS cannot access
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        accessToken, // frontend memory me store hoga
      });
  } catch (error) {
    console.error("LOGIN ERROR 👉", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================= CHANGE PASSWORD ================= */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const employee = await Employee.findById(req.user.userId).select(
      "+password",
    );

    const isMatch = await bcrypt.compare(oldPassword, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    employee.password = await bcrypt.hash(newPassword, 10);
    await employee.save();

    res.json({ message: "Password changed successfully" });
  } catch {
    res.status(500).json({ message: "Password change failed" });
  }
};

/* ================= EMAIL OTP ================= */
export const sendEmailOTP = async (req, res) => {
  const employee = await Employee.findById(req.user.userId);

  if (employee.emailVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  employee.emailOTP = otp;
  employee.emailOTPExpiry = Date.now() + 10 * 60 * 1000;
  await employee.save();

  await sendEmail({
    to: employee.email,
    subject: "Verify your email",
    html: verifyEmailOtpTemplate(otp),
  });

  res.json({ message: "OTP sent to email" });
};

/* ================= VERIFY EMAIL OTP ================= */
export const verifyEmailOTP = async (req, res) => {
  const { otp } = req.body;

  const employee = await Employee.findById(req.user.userId);

  if (
    employee.emailOTP !== Number(otp) ||
    employee.emailOTPExpiry < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  employee.emailVerified = true;
  employee.emailOTP = null;
  employee.emailOTPExpiry = null;
  await employee.save();

  res.json({ message: "Email verified successfully" });
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  const employee = await Employee.findOne({ email: req.body.email });

  const resetToken = crypto.randomBytes(32).toString("hex");
  employee.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  employee.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;
  await employee.save();

  // send email (same as your code)
  res.json({ message: "Password reset link sent" });
};

/* ================= RESET PASSWORD ================= */
export const resetPasswordController = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const employee = await Employee.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  employee.password = await bcrypt.hash(req.body.newPassword, 10);
  employee.forgotPasswordToken = null;
  employee.forgotPasswordExpiry = null;
  await employee.save();

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

    const user = await Employee.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
};
