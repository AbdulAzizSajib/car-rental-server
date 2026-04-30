import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { fuelTypeController } from "./fuel-type.controller";
import { fuelTypeValidation } from "./fuel-type.validation";

const fuelTypeRouter = Router();

fuelTypeRouter.get("/", fuelTypeController.getAllFuelTypes);
fuelTypeRouter.get("/:id", fuelTypeController.getSingleFuelType);

fuelTypeRouter.post(
  "/",
  checkAuth(UserRole.ADMIN),
  validateRequest(fuelTypeValidation.createFuelTypeSchema),
  fuelTypeController.createFuelType,
);

fuelTypeRouter.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  validateRequest(fuelTypeValidation.updateFuelTypeSchema),
  fuelTypeController.updateFuelType,
);

fuelTypeRouter.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  fuelTypeController.deleteFuelType,
);

export default fuelTypeRouter;
