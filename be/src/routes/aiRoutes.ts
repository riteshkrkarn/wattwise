import { Router } from "express";
import { AIController } from "../controllers/AIController";

const router = Router();

router.post("/analyze", AIController.analyze);

export default router;
