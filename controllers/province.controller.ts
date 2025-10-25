import { Request, Response } from 'express';
import { ProvinceService } from '../services';
import { CreateProvinceDto, PaginationDto } from '../dtos';
import { handleError } from '../utils';

export class ProvinceController {
    constructor(private readonly provinceService: ProvinceService) {}

    public createProvince = async (req: Request, res: Response): Promise<any> => {
        const [error, createProvinceDto] = CreateProvinceDto.create(req.body);
        if (error) return res.status(400).json({ error });
        // console.log('error: ', error)
        this.provinceService
            .createProvince(createProvinceDto!)
            .then((province) => res.status(400).json(province))
            .catch((error) => handleError(error, res));
    };

    public getProvinces = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 100 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.provinceService
            .getProvinces(paginationDto!)
            .then((result) =>
                res.status(200).json({
                    success: true,
                    ...result,
                })
            )
            .catch((error) => handleError(error, res));
    };

    // public getProvinceById = async (req: Request, res: Response): Promise<any> => {
    //     const { id } = req.params;

    // }
}
