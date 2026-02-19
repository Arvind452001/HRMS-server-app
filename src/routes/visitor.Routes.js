import express from "express";
import { createVisitor } from './../controllers/EmployeeControllers/visitor.Controller.js';

const router = express.Router();

router.post("/create", createVisitor);

export default router;
