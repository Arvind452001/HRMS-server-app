import express from "express";
import { createInterview, deleteInterview, getInterviewsByApplication, updateInterview } from "../controllers/jodsController/interview.controller";

const router = express.Router();

router.post("/create", createInterview);
router.get("/:applicationId", getInterviewsByApplication);
router.patch("/updateInterview/:id", updateInterview);
router.delete("/deleteInterview/:id", deleteInterview);

export default router;
