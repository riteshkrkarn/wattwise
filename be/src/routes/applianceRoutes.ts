import { Router } from "express";
import { UserApplianceController } from "../controllers/UserApplianceController";
import { validate } from "../middlewares/validateResource";
import { applianceSchema } from "../schema/applianceZodSchema";

const router = Router();

router.post(
  "/",
  validate(applianceSchema),
  UserApplianceController.createAppliance
);
router.get("/", UserApplianceController.getUserAppliances);
router.delete("/:id", UserApplianceController.deleteAppliance);

export default router;
