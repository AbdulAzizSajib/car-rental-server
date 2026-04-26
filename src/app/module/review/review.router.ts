import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../../generated/prisma/enums";
import { reviewController } from "./review.controller";
import { reviewValidation } from "./review.validation";

const reviewRouter = Router();

reviewRouter.get("/", reviewController.getCarReviews);

reviewRouter.post(
  "/",
  checkAuth(UserRole.USER),
  validateRequest(reviewValidation.createReviewSchema),
  reviewController.createReview,
);

reviewRouter.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  reviewController.deleteReview,
);

export default reviewRouter;
