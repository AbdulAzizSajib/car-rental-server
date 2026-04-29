import { Router } from "express";
import { brandController } from "./brand.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { brandValidation } from "./brand.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const brandRouter = Router();

brandRouter.get("/", brandController.getAllBrands);
brandRouter.get("/:id", brandController.getSingleBrand);

brandRouter.post(
  "/",
  checkAuth(UserRole.ADMIN),
  validateRequest(brandValidation.createBrandSchema),
  brandController.createBrand,
);

brandRouter.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  validateRequest(brandValidation.updateBrandSchema),
  brandController.updateBrand,
);

brandRouter.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  brandController.deleteBrand,
);

export default brandRouter;
