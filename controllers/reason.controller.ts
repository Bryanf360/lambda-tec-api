import { Request, Response } from 'express';

import { ReasonService } from '../services';
import { CreateReasonDto, PaginationDto, UpdateReasonDto } from '../dtos';
import { handleError } from '../utils';
import { reasons_type } from '@prisma/client';

export class ReasonController {
    constructor(private readonly reasonService: ReasonService) {}

    public createReason = async (req: Request, res: Response): Promise<any> => {
        const [error, createReasonDto] = CreateReasonDto.create(req.body);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.reasonService
            .createReason(createReasonDto!)
            .then((reason) =>
                res.status(200).json({
                    success: true,
                    message: 'Reason created successfully',
                    data: reason,
                })
            )
            .catch((error) => handleError(error, res));
    };

    public getReasonsByType = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 10 } = req.query;
        const { type } = req.params;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.reasonService
            .getReasonsByType(type as reasons_type, paginationDto!)
            .then((result) =>
                res.status(200).json({
                    success: true,
                    ...result,
                })
            )
            .catch((error) => handleError(error, res));
    };

    public updateReason = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        const [error, updateReasonDto] = UpdateReasonDto.create(req.body);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.reasonService
            .updateReasonById(+id, updateReasonDto!)
            .then((reason) =>
                res.status(200).json({
                    success: true,
                    message: 'Reason updated successfully',
                    data: reason,
                })
            )
            .catch((error) => handleError(error, res));
    };

    public deleteReason = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        this.reasonService
            .deleteReasonById(+id)
            .then((reason) =>
                res.status(200).json({
                    success: true,
                    message: 'Reason deleted successfully',
                    data: reason,
                })
            )
            .catch((error) => handleError(error, res));
    };
}
