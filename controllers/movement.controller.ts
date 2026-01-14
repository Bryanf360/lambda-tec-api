import { Request, Response } from 'express';

import { CustomError } from '../utils';
import { CreateMovementDto } from '../dtos/create-movement.dto';
import { MovementService } from '../services';

export class MovementController {
    constructor(private readonly movementService: MovementService) {}

    public createInput = async (req: Request, res: Response): Promise<any> => {
        const [error, createMovementDto] = CreateMovementDto.create(req.body);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.movementService
            .createMovement(createMovementDto!)
            .then((input) =>
                res.status(200).json({
                    success: true,
                    message: 'Movimiento creado exitosamente',
                    data: input,
                })
            )
            .catch((error) => this.handleError(error, res));
    };

    public createOutput = async (req: Request, res: Response): Promise<any> => {
        const [error, createMovementDto] = CreateMovementDto.create(req.body);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.movementService
            .createOutput(createMovementDto!)
            .then((output) =>
                res.status(200).json({
                    success: true,
                    message: 'Movimiento creado exitosamente',
                    data: output,
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
