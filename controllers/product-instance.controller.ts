import { Request, Response } from 'express';

import { CustomError } from '../utils';
import { ProductInstanceService } from '../services';

export class ProductInstanceController {
    constructor(private readonly productInstanceService: ProductInstanceService) {}

    public getProductInstancesByProductIdAndWarehouseId = async (
        req: Request,
        res: Response
    ): Promise<any> => {
        const { productId, warehouseId } = req.query;
        this.productInstanceService
            .getInstancesByProductIdAndWarehouseId(+productId!, +warehouseId!)
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
