import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { bodyTypeController } from "./body-type.controller";
import { bodyTypeValidation } from "./body-type.validation";

const bodyTypeRouter = Router();

bodyTypeRouter.get("/", bodyTypeController.getAllBodyTypes);
bodyTypeRouter.get("/:id", bodyTypeController.getSingleBodyType);

bodyTypeRouter.post(
  "/",
  checkAuth(UserRole.ADMIN),
  validateRequest(bodyTypeValidation.createBodyTypeSchema),
  bodyTypeController.createBodyType,
);

bodyTypeRouter.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  validateRequest(bodyTypeValidation.updateBodyTypeSchema),
  bodyTypeController.updateBodyType,
);

bodyTypeRouter.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  bodyTypeController.deleteBodyType,
);

export default bodyTypeRouter;
