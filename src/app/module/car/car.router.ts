import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { multerUpload } from "../../config/multer.config";
import { carController } from "./car.controller";
import { carValidation } from "./car.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const carRouter = Router();

carRouter.get("/", carController.getAllCars);

carRouter.post(
  "/create",
  checkAuth(UserRole.ADMIN),
  validateRequest(carValidation.createCarSchema),
  carController.createCarProfile,
);

carRouter.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  validateRequest(carValidation.updateCarSchema),
  carController.updateCar,
);

carRouter.delete("/:id", checkAuth(UserRole.ADMIN), carController.deleteCar);

carRouter.post(
  "/:id/images",
  checkAuth(UserRole.ADMIN),
  multerUpload.array("images", 10),
  carController.uploadCarImages,
);

carRouter.delete(
  "/images/:imageId",
  checkAuth(UserRole.ADMIN),
  carController.deleteCarImage,
);

export default carRouter;
