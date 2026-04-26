import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { driverController } from "./driver.controller";
import { driverValidation } from "./driver.validation";

const driverRouter = Router();

driverRouter.get("/", driverController.getAllDrivers);

driverRouter.get("/:id", driverController.getSingleDriver);

driverRouter.post(
  "/",
  checkAuth(UserRole.ADMIN),
  validateRequest(driverValidation.createDriverSchema),
  driverController.createDriver,
);

driverRouter.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  validateRequest(driverValidation.updateDriverSchema),
  driverController.updateDriver,
);

export default driverRouter;
