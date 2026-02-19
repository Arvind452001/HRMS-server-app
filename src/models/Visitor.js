import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* ================= ENUM ARRAYS ================= */

const experienceOptions = [
  "Less than 1 year",
  "1-2 years",
  "2-3 years",
  "3-4 years",
  "4-5 years",
  "5-6 years",
  "6-7 years",
  "7-8 years",
  "8-9 years",
  "9-10 years",
  "10+ years",
];

const visitorSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["enquiry", "training", "interview", "candidate", "client"],
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    purposeOfVisit: String,
    personToMeet: String,

    visitDate: Date,
    checkInTime: Date,
    checkOutTime: Date,

    remarks: String,

    /* ================= Candidate Only ================= */

    technology: String,

    /* ================= Interview Only ================= */

    domain: String,

    totalExperience: {
      type: String,
      enum: experienceOptions,
    },

    currentCtc: {
      type: String,   // ✅ Now string like "6 LPA"
    },

    expectedCtc: {
      type: String,   // ✅ Now string like "9 LPA"
    },

    currentOrganization: String,

    jobSource: String,

    /* ================= Auth ================= */

    password: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

/* 🔐 Encrypt password before save */
visitorSchema.pre("save", async function () {
  if (!this.password) return;
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("Visitor", visitorSchema);
