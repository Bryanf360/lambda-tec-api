import { Request, Response } from "express";

import { ModelService } from "../services/model.service";
import { CreateModelDto, PaginationDto, UpdateModelDto } from "../dtos";
import { handleError } from "../utils/handle.error";

export class ModelController {

    constructor(
        private modelService: ModelService,
    ) {}
    
    public getModels = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 10 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.modelService.getModels(paginationDto!)
            .then(result => res.status(200).json({
                success: true,
                ...result
            }))
            .catch(error => handleError(error, res))
    }

    public getModelsByBrandId = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 1000 } = req.query;
        const { brandId } = req.params;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.modelService.getModelsByBrandId(+brandId, paginationDto!)
            .then(result => res.status(200).json({
                success: true,
                ...result
            }))
            .catch(error => handleError(error, res))
    }

    public createModel = async (req: Request, res: Response): Promise<any> => {
        const [error, createModelDto] = CreateModelDto.create(req.body);
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.modelService.createModel(createModelDto!)
            .then(model => res.status(200).json({
                success: true,
                message: 'Model created successfully',
                data: model
            }))
            .catch(error => handleError(error, res));
    }

    public updateModel = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        const [error, updateModelDto] = UpdateModelDto.create(req.body);
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.modelService.updateModelById(+id, updateModelDto!)
            .then(model => res.status(200).json({
                success: true,
                message: 'Model updated successfully',
                data: model
            }))
            .catch(error => handleError(error, res));
    }

    public deleteModel = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        this.modelService.deleteModelById(+id)
            .then(result => res.status(200).json({
                success: true,
                message: 'Model deleted successfully',
                data: result
            }))
            .catch(error => handleError(error, res)) 
    }
}