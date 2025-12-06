import { Router } from "express";
import { UserApplianceController } from "../controllers/UserApplianceController";
import { validate } from "../middlewares/validateResource";
import {
  applianceSchema,
  updateApplianceSchema,
} from "../schema/applianceZodSchema";

import { verifyJWT } from "../middlewares/verifyJWT";

const router = Router();

router.use(verifyJWT); // Apply to all routes in this file

router.post(
  "/",
  validate(applianceSchema),
  UserApplianceController.createAppliance
);
router.get("/", UserApplianceController.getUserAppliances);
router.patch(
  "/:id",
  validate(updateApplianceSchema),
  UserApplianceController.updateAppliance
);
router.delete("/:id", UserApplianceController.deleteAppliance);

export default router;
