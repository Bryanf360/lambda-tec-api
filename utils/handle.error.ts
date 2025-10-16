import { Response } from "express";

import { CustomError } from "./custom.error";

export const handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            error: error.error
        });
    }
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'InternalServerError'
    });
}