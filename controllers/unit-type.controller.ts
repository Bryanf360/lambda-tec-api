import { Request, Response } from "express";
import { CreateUnitTypeDto, PaginationDto, UpdateUnitTypeDto } from "../dtos";
import { handleError } from "../utils";
import { UnitTypeService } from "../services";

export class UnitTypeController {

    constructor(
        private readonly unitTypeService: UnitTypeService
    ) {}
    
    public createUnitType = async (req: Request, res: Response): Promise<any> => {
        const [error, createUnitTypeDto] = CreateUnitTypeDto.create(req.body);
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.unitTypeService.createUnitType(createUnitTypeDto!)
            .then(unitType => res.status(200).json({
                success: true,
                message: 'Unit type created successfully',
                data: unitType
            }))
            .catch(error => handleError(error, res))
    }

    public getUnitTypes = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 10 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.unitTypeService.getUnitTypes(paginationDto!)
            .then(result => res.status(200).json({
                success: true,
                ...result
            }))
            .catch(error => handleError(error, res));
    }

    public updateUnitType = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        const [error, updateUnitTypeDto] = UpdateUnitTypeDto.create(req.body);
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.unitTypeService.updateUnitTypeById(+id, updateUnitTypeDto!)
            .then(unitType => res.status(200).json({
                success: true,
                message: 'Unit type updated successfully',
                data: unitType
            }))
            .catch(error => handleError(error, res));
    }

    public deleteUnitType = (req: Request, res: Response) => {
        const { id } = req.params;
        this.unitTypeService.deleteUnitTypeById(+id)
            .then(unitType => res.status(200).json({
                success: true,
                message: 'Unit type deleted successfully',
                data: unitType
            }))
            .catch(error => handleError(error, res));
    }
}