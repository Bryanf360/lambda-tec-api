import { Request, Response } from 'express';
import { CityService } from '../services';
import { CreateCityDto, PaginationDto } from '../dtos';
import { handleError } from '../utils';

export class CityController {
    constructor(private readonly cityService: CityService) {}

    public createCity = async (req: Request, res: Response): Promise<any> => {
        const [error, createCityDto] = CreateCityDto.create(req.body);
        if (error) return res.status(400).json({ error });
        this.cityService
            .createCity(createCityDto!)
            .then((city) => res.status(200).json(city))
            .catch((error) => handleError(error, res));
    };

    public getCities = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 10 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error) return res.status(400).json({ error });
        this.cityService
            .getCities(paginationDto!)
            .then((result) =>
                res.status(200).json({
                    success: true,
                    ...result,
                })
            )
            .catch((error) => handleError(error, res));
    };

    public getCitiesByProvince = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 10 } = req.query;
        const { provinceId } = req.params;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error) return res.status(400).json({ error });
        this.cityService
            .getCitiesByProvinceId(+provinceId, paginationDto!)
            .then((result) =>
                res.status(200).json({
                    success: true,
                    ...result,
                })
            )
            .catch((error) => handleError(error, res));
    };
}
