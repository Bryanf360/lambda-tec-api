import { Request, Response } from 'express';

import { WarehouseService } from '../services/warehouse.service';
import { PaginationDto } from '../dtos';
import { CustomError } from '../utils';

export class WarehouseController {
    constructor(private warehouseService: WarehouseService) {}

    public getWarehouses = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 10 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.warehouseService
            .getWarehouses(paginationDto!)
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
