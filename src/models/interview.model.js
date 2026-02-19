import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    interviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    interviewType: {
      type: String,
      enum: ["hr", "technical", "managerial"],
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    feedback: {
      type: String,
    },
    result: {
      type: String,
      enum: ["pending", "passed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
