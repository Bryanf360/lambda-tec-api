import { NextFunction, Request, Response } from "express";

export class ValidateIdMiddlware {

    static validateId(req: Request, res: Response, next: NextFunction): any {
        const { id } = req.params;
        if (!id || isNaN(+id) || Number(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Id is not valid',
                error: 'ValidationError'
            })
        }
        next();
    }
}