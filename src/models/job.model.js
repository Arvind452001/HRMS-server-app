import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: String,
    companyName: {
      type: String,
      required: true,
    },
    industry: String,

    location: {
      type: String,
      required: true,
    },
    workplaceType: {
      type: String,
      enum: ["On-site", "Remote", "Hybrid"],
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      required: true,
    },

    experienceMin: Number,
    experienceMax: Number,

    overview: {
      type: String,
      required: true,
    },

    responsibilities: [String],
    requiredSkills: [String],
    goodToHaveSkills: [String],
    qualifications: String,
    certifications: [String],

    salaryMin: Number,
    salaryMax: Number,
    currency: {
      type: String,
      default: "INR",
    },

    benefits: [String],

    applicationEmail: String,
    applicationLink: String,
    applicationDeadline: Date,
    // requiredDocuments: [String],
    // contactPerson: String,

    status: {
      type: String,
      enum: ["Draft", "Published", "Closed"],
      default: "Draft",
    },

    visibility: {
      type: String,
      enum: ["Public", "Internal"],
      default: "Internal",
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);

