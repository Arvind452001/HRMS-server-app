import express from "express";
import { createJob, deleteJob, getAllJobs, getJobById, updateJob, updateJobStatus } from "../controllers/jodsController/job.controller.js";

const router = express.Router();

router.post("/createJob", createJob);
router.get("/getAllJobs", getAllJobs);
router.get("/getJobById/:id", getJobById);
router.patch("/updateJob/:id", updateJob);
router.delete("/deleteJob/:id", deleteJob);
router.patch("/updateJobStatus/:id/status", updateJobStatus);

export default router;
