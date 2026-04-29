import { Router } from "express";
import { carModelController } from "./car-model.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { carModelValidation } from "./car-model.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const carModelRouter = Router();

carModelRouter.get("/", carModelController.getAllCarModels);
carModelRouter.get("/:id", carModelController.getSingleCarModel);

carModelRouter.post(
  "/",
  checkAuth(UserRole.ADMIN),
  validateRequest(carModelValidation.createCarModelSchema),
  carModelController.createCarModel,
);

carModelRouter.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  validateRequest(carModelValidation.updateCarModelSchema),
  carModelController.updateCarModel,
);

carModelRouter.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  carModelController.deleteCarModel,
);

export default carModelRouter;
