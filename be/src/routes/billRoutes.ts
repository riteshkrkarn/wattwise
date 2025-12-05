import { Router } from "express";
import { BillController } from "../controllers/BillController";
import { validate } from "../middlewares/validateResource";
import {
  estimationSchema,
  comparisonSchema,
  saveRecordSchema,
} from "../schema/applianceZodSchema";
import { verifyJWT } from "../middlewares/verifyJWT";

const router = Router();

router.get("/presets", BillController.getPresets);
router.post("/estimate", validate(estimationSchema), BillController.estimate);
router.post("/compare", validate(comparisonSchema), BillController.compare);

// Protected Routes
router.post(
  "/save",
  verifyJWT,
  validate(saveRecordSchema),
  BillController.saveRecord
);
router.get("/history", verifyJWT, BillController.getHistory);

export default router;
