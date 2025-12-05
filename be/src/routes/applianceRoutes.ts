import { Router } from "express";
import { UserApplianceController } from "../controllers/UserApplianceController";
import { validate } from "../middlewares/validateResource";
import { applianceSchema } from "../schema/applianceZodSchema";

import { verifyJWT } from "../middlewares/verifyJWT";

const router = Router();

router.use(verifyJWT); // Apply to all routes in this file

router.post(
  "/",
  validate(applianceSchema),
  UserApplianceController.createAppliance
);
router.get("/", UserApplianceController.getUserAppliances);
router.delete("/:id", UserApplianceController.deleteAppliance);

export default router;
