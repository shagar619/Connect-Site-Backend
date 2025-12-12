import { Request, Response } from "express";
import httpStatus from "http-status-codes";
const notFound = (_req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    statusCode: 404,
    message: " Route not found! ",
  });
};

export default notFound;