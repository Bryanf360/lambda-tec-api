import { Request, Response } from "express";
import { PartNumberService } from "../services";
import { CreatePartNumberDto, PaginationDto, UpdatePartNumberDto } from "../dtos";
import { handleError } from "../utils";

export class PartNumberController {

    constructor(
        private partNumberService: PartNumberService,
    ) {}

    public createPartNumber = async (req: Request, res: Response): Promise<any> => {
        const [error, createPartNumberDto] = CreatePartNumberDto.create(req.body);
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'           
        });
        this.partNumberService.createPartNumber(createPartNumberDto!)
            .then(partNumber => res.status(200).json({
                success: true,
                message: 'Part number created successfully',
                data: partNumber
            }))
            .catch(error => handleError(error, res));
    }

    public getPartNumbers = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 10 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.partNumberService.getPartNumbers(paginationDto!)
            .then(result => res.status(200).json({
                success: true,
                ...result
            }))
            .catch(error => handleError(error, res));
    }

    public getPartNumbersByModel = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 10 } = req.query;
        const { modelId } = req.params; 
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.partNumberService.getPartNumbersByModelId(+modelId, paginationDto!)
            .then(result => res.status(200).json({
                success: true,
                ...result
            }))
            .catch(error => handleError(error, res));
    }

    public updatePartNumber = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params; 
        const [error, updatePartNumberDto] = UpdatePartNumberDto.create(req.body)
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.partNumberService.updatePartNumberById(+id, updatePartNumberDto!)
            .then(partNumber => res.status(200).json({
                success: true,
                message: 'Part number updated successfully',
                data: partNumber
            }))
            .catch(error => handleError(error, res))
    }

    public deletedPartNumber = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        this.partNumberService.deletePartNumberById(+id)
            .then(partNumber => res.status(200).json({
                success: true,
                message: 'Part number deleted successfully',
                data: partNumber
            }))
            .catch(error => handleError(error, res));
    }
}