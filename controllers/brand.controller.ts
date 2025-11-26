import { Request, Response } from "express";

import { BrandService } from "../services/brand.service";
import { CustomError } from "../utils";
import { CreateBrandDto, PaginationDto, UpdateBrandDto } from "../dtos";

export class BrandController {

    constructor(
        private readonly brandService: BrandService
    ) {}

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ 
                success: false,
                message: error.message,
                error: error.error
            });
        }
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: 'InternalServerError'
        });
    }

    public createBrand = async (req: Request, res: Response): Promise<any> => {
        const [error, createBrandDto] = CreateBrandDto.create(req.body);
        if (error) return res.status(400).json({ 
            success: false,
            message: error,
            error: 'ValidationError'
         });
        this.brandService.createBrand(createBrandDto!)
            .then(brand => res.status(200).json({
                success: true,
                message: 'Brand created successfully',
                data: brand
            }))
            .catch(error => this.handleError(error, res));
    }

    public getBrands = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 1000 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit)
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.brandService.getBrands(paginationDto!)
            .then(result => res.status(200).json({
                success: true,
                ...result
            }))
            .catch(error => this.handleError(error, res))
    }

    public getBrandById = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        this.brandService.getBrandById(+id)
            .then(brand => res.status(200).json({
                success: true,
                data: brand
            }))
            .catch(error => this.handleError(error, res))
    }

    public updateBrandById = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        const [error, updatedBrandDto] = UpdateBrandDto.create(req.body);
        if (error) return res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        })
        this.brandService.updateBrandById(+id, updatedBrandDto!)
            .then(brand => res.status(200).json({
                success: true,
                message: 'Brand updated successfully',
                data: brand
            }))
            .catch(error => this.handleError(error, res));
    }

    public deleteBrandById = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        this.brandService.deleteBrandById(+id)
            .then(brand => res.status(200).json({
                success: true,
                message: 'Brand deleted successfully',
                data: brand
            }))
            .catch(error => this.handleError(error, res));
    }
}