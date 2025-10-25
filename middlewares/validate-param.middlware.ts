import { NextFunction, Request, Response } from 'express';

export class ValidateParamMiddlware {
    static validateType(req: Request, res: Response, next: NextFunction): any {
        const { type = '' } = req.params;
        if (!['input', 'output'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type is not valid',
                error: 'ValidationError',
            });
        }
        next();
    }
}
