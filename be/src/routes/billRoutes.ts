import { Router } from "express";
import multer from "multer";
import { BillController } from "../controllers/BillController";
import { BillUploadController } from "../controllers/BillUploadController";
import { validate } from "../middlewares/validateResource";
import {
  estimationSchema,
  comparisonSchema,
  saveRecordSchema,
} from "../schema/applianceZodSchema";
import { verifyJWT } from "../middlewares/verifyJWT";

const router = Router();

// Configure multer for PDF uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

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

// PDF Upload Route (Protected)
router.post(
  "/upload",
  verifyJWT,
  upload.single("billPdf"),
  BillUploadController.uploadAndParse
);

export default router;
