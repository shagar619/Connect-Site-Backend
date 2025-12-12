import { Response } from "express";

interface TMeta{
    page?: number;
    limit?: number;
    total?: number;
}
interface IResponse<T>{
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
    meta?: TMeta;
}

export const sendResponse = <T>(res: Response, data: IResponse<T>) => {

    res.status(data.statusCode).json({
        statusCode: data.statusCode,
        success: data.success,
        message: data.message,
        data: data.data,
        meta: data.meta,
    });
};