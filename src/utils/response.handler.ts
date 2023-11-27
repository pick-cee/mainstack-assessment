/**
 * @description Response handler
 */

import { Response } from "express";
import { ICustomException } from "../interfaces/exception.interface";

class CustomResponse {
    res: Response;
    exception?: ICustomException

    constructor(res: Response, err?: ICustomException) {
        this.res = res
        this.exception = err || new Error()
    }

    // send success response with status code and data
    public success(
        message: string = "",
        data: any = {},
        statusCode: number = 200,
        meta: any = {}
    ) {
        return this.res.status(statusCode || 200).json({
            success: true,
            code: statusCode || 200,
            message,
            data,
            meta,
        })
    }

    // send error response with status code and data
    public error(
        message?: string | any[],
        statusCode?: number,
        data?: any,
        meta?: any
    ) {
        return this.res.status(statusCode as number).json({
            success: false,
            code: statusCode,
            message: message,
            data,
            meta,
        })
    }
}

export default CustomResponse