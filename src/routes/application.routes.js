import express from "express";
import { createApplication, deleteApplication, getAllApplications, getApplicationsByCandidate, getApplicationsByJob, moveApplicationStage } from "../controllers/jodsController/application.controller";


const router = express.Router();

router.post("/createApplication", createApplication);
router.get("/getAllApplications", getAllApplications);
router.get("/job/:jobId", getApplicationsByJob);
router.get("/candidate/:candidateId", getApplicationsByCandidate);
router.patch("/moveStage/:id/move-stage", moveApplicationStage);
router.delete("/delete/:id", deleteApplication);

export default router;
