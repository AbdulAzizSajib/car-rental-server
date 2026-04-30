import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { bodyTypeService } from "./body-type.service";

const getAllBodyTypes = catchAsync(async (req: Request, res: Response) => {
  const result = await bodyTypeService.getAllBodyTypes(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Body types fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleBodyType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await bodyTypeService.getSingleBodyType(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Body type fetched successfully",
    data: result,
  });
});

const createBodyType = catchAsync(async (req: Request, res: Response) => {
  const result = await bodyTypeService.createBodyType(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Body type created successfully",
    data: result,
  });
});

const updateBodyType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await bodyTypeService.updateBodyType(id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Body type updated successfully",
    data: result,
  });
});

const deleteBodyType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await bodyTypeService.deleteBodyType(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Body type deleted successfully",
    data: null,
  });
});

export const bodyTypeController = {
  getAllBodyTypes,
  getSingleBodyType,
  createBodyType,
  updateBodyType,
  deleteBodyType,
};
