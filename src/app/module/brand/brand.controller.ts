import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { brandService } from "./brand.service";

const getAllBrands = catchAsync(async (req: Request, res: Response) => {
  const result = await brandService.getAllBrands(
    req.query as Record<string, unknown>,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Brands fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await brandService.getSingleBrand(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Brand fetched successfully",
    data: result,
  });
});

const createBrand = catchAsync(async (req: Request, res: Response) => {
  const result = await brandService.createBrand(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Brand created successfully",
    data: result,
  });
});

const updateBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await brandService.updateBrand(id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Brand updated successfully",
    data: result,
  });
});

const deleteBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await brandService.deleteBrand(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Brand deleted successfully",
    data: null,
  });
});

export const brandController = {
  getAllBrands,
  getSingleBrand,
  createBrand,
  updateBrand,
  deleteBrand,
};
