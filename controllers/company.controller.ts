import { Request, Response } from 'express';

import { CompanyService } from '../services';
import { CreateCompanyDto, PaginationDto, UpdateCompanyDto } from '../dtos';
import { handleError } from '../utils';

export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    public createCompany = async (req: Request, res: Response): Promise<any> => {
        const [error, createCompanyDto] = CreateCompanyDto.create(req.body);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.companyService
            .createCompany(createCompanyDto!)
            .then((company) =>
                res.status(200).json({
                    success: true,
                    message: 'Company created successfully',
                    data: company,
                })
            )
            .catch((error) => handleError(error, res));
    };

    public getCompanies = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 5 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.companyService
            .getCompanies(paginationDto!)
            .then((result) =>
                res.status(200).json({
                    success: true,
                    ...result,
                })
            )
            .catch((error) => handleError(error, res));
    };

    public deleteCompany = async (req: Request, res: Response) => {
        const { id } = req.params;
        this.companyService
            .deleteCompanyById(+id)
            .then((company) =>
                res.status(200).json({
                    success: true,
                    message: 'Company deleted successfully',
                    data: company,
                })
            )
            .catch((error) => handleError(error, res));
    };

    public updateCompany = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        const [error, updateCompanyDto] = UpdateCompanyDto.create(req.body);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationTypeError',
            });
        this.companyService
            .updateCompanyById(+id, updateCompanyDto!)
            .then((company) =>
                res.status(200).json({
                    success: true,
                    message: 'Company updated successfully',
                    data: company,
                })
            )
            .catch((error) => handleError(error, res));
    };
}
