import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    /* ================= AUTH ================= */

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true, // bcrypt hashed
      select: false, // 🔥 password never auto-fetch
    },

    role: {
      type: String,
      enum: ["employee", "hr", "admin"],
      default: "employee",
      index: true,
    },

    /* ================= HR CONTROLLED ================= */

   employeeCode: {
  type: String,
  // unique: true,
  sparse: true,
  default: null,
},


    department: {
      type: String,
      default: null,
    },

    designation: {
      type: String,
      default: null,
    },

    dateOfJoining: {
      type: Date,
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // HR/Admin
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    /* ================= EMPLOYEE DATA ================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    contactNo: {
      type: String,
      default: null,
    },

    personalEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },

    currentAddress: {
      type: String,
      default: null,
    },

    permanentAddress: {
      type: String,
      default: null,
    },

    emergencyNo: {
      type: String,
      default: null,
    },

    /* ================= APPROVAL / STATUS ================= */

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: false, // 🔥 login blocked until approval
      index: true,
    },

    /* ================= EMAIL VERIFICATION ================= */

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailOTP: {
      type: Number,
      default: null,
    },

    emailOTPExpiry: {
      type: Date,
      default: null,
    },

    /* ================= PASSWORD RESET ================= */

    forgotPasswordToken: {
      type: String,
      default: null,
    },

    forgotPasswordExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Employee", employeeSchema);
