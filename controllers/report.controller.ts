import { Request, Response } from 'express';

import { CustomError } from '../utils';
import { ReportService } from '../services';
import { PaginationDto } from '../dtos';

export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    public getInstances = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 1000 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.reportService
            .getInstances(paginationDto!)
            .then((result) =>
                res.status(200).json({
                    success: true,
                    ...result,
                })
            )
            .catch((error) => this.handleError(error, res));
    };

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error: error.error,
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'InternalServerError',
        });
    };
}
