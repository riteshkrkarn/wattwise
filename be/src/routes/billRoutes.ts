import { Router } from "express";
import { BillController } from "../controllers/BillController";
import { validate } from "../middlewares/validateResource";
import {
  estimationSchema,
  comparisonSchema,
} from "../schema/applianceZodSchema";

const router = Router();

router.get("/presets", BillController.getPresets);
router.post("/estimate", validate(estimationSchema), BillController.estimate);
router.post("/compare", validate(comparisonSchema), BillController.compare);

export default router;
