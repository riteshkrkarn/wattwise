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
  (req, res, next) => {
    console.log("🎯 /upload route hit - BEFORE verifyJWT");
    next();
  },
  verifyJWT,
  (req, res, next) => {
    console.log("🎯 /upload route - AFTER verifyJWT, BEFORE multer");
    next();
  },
  upload.single("billPdf"),
  (req, res, next) => {
    console.log("🎯 /upload route - AFTER multer, BEFORE controller");
    next();
  },
  BillUploadController.uploadAndParse
);

// Multer error handler for this route
router.use((error: any, req: any, res: any, next: any) => {
  console.log("🚨 Multer/Route Error Handler:", error.message);
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        statusCode: 400,
        data: null,
        success: false,
        message: "File size too large. Maximum size is 10MB.",
        errors: [],
      });
    }
    return res.status(400).json({
      statusCode: 400,
      data: null,
      success: false,
      message: error.message,
      errors: [],
    });
  }
  next(error);
});

export default router;
