import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const employeeSchema = new mongoose.Schema(
  {
    /* ================= AUTH ================= */

    email: {
      type: String,
      required: true,
      unique: true, // automatically indexed
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // never return password by default
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
      unique: true,
      sparse: true, // unique only when value exists
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
      ref: "Employee",
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
      default: false, // login blocked until approval
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
  }
);


// ================= PASSWORD HASHING =================

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


// ================= PASSWORD COMPARE METHOD =================

employeeSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// ================= SAFE MODEL EXPORT =================

// ================= SAFE MODEL EXPORT =================

const Employee =
  mongoose.models.Employee ||
  mongoose.model("Employee", employeeSchema);

export default Employee;



