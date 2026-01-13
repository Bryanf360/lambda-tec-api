import { CreateCompanyDto, PaginationDto, UpdateCompanyDto } from '../dtos';
import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

const selectedFields = {
    id: true,
    type: true,
    names: true,
    lastnames: true,
    ruc: true,
    landline: true,
    mobile_phone: true,
    province: {
        select: {
            id: true,
            name: true,
            description: true,
        },
    },
    city: {
        select: {
            id: true,
            name: true,
            description: true,
        },
    },
    address: true,
    description: true,
};

export class CompanyService {
    public async createCompany(createCompanyDto: CreateCompanyDto): Promise<any> {
        try {
            const companyExists = await prisma.companies.findFirst({
                where: {
                    ruc: createCompanyDto.ruc,
                },
            });
            if (companyExists && !companyExists.is_deleted)
                throw CustomError.badRequest('Company already exists');
            if (companyExists && companyExists.is_deleted)
                throw CustomError.badRequest('Cannot use this ruc. It belongs to a deleted record');
            const [provinceExists, cityExists] = await Promise.all([
                prisma.provinces.findFirst({
                    where: {
                        id: createCompanyDto.provinceId,
                    },
                }),
                prisma.cities.findFirst({
                    where: {
                        id: createCompanyDto.cityId,
                    },
                }),
            ]);
            if (!provinceExists) throw CustomError.notFound('Province not found');
            if (!cityExists) throw CustomError.notFound('City not found');
            const craetedCompany = await prisma.companies.create({
                data: {
                    type: createCompanyDto.type,
                    names: createCompanyDto.names,
                    lastnames: createCompanyDto.lastnames,
                    ruc: createCompanyDto.ruc,
                    landline: createCompanyDto.landline,
                    mobile_phone: createCompanyDto.mobilePhone,
                    fk_province_id: createCompanyDto.provinceId,
                    fk_city_id: createCompanyDto.cityId,
                    address: createCompanyDto.address,
                    description: createCompanyDto.description,
                },
            });
            return craetedCompany;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async getCompaniesByType(
        type: 'client' | 'supplier',
        paginationDto: PaginationDto
    ): Promise<any> {
        const { page, limit } = paginationDto;
        try {
            const [companies, total] = await Promise.all([
                prisma.companies.findMany({
                    where: {
                        is_deleted: false,
                        type,
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    select: selectedFields,
                }),
                prisma.companies.count({
                    where: {
                        is_deleted: false,
                        type,
                    },
                }),
            ]);
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev: page - 1 > 0 ? `/api/companies?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/companies?page=${page + 1}&limit=${limit}`,
                },
                data: companies,
            };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async updateCompanyById(id: number, updateCompanyDto: UpdateCompanyDto): Promise<any> {
        try {
            if (updateCompanyDto.provinceId) {
                const provinceExists = await prisma.provinces.findFirst({
                    where: {
                        id: +updateCompanyDto.provinceId,
                    },
                });
                if (!provinceExists) throw CustomError.notFound('Province not found');
            }
            if (updateCompanyDto.cityId) {
                const cityExists = await prisma.cities.findFirst({
                    where: {
                        id: +updateCompanyDto.cityId,
                    },
                });
                if (!cityExists) throw CustomError.notFound('City not found');
            }
            const companyExists = await prisma.companies.findFirst({
                where: {
                    id: id,
                    is_deleted: false,
                },
            });
            if (!companyExists) throw CustomError.notFound('Company not found');
            if (updateCompanyDto.ruc) {
                const companyRucExists = await prisma.companies.findFirst({
                    where: {
                        ruc: updateCompanyDto.ruc,
                    },
                });
                if (companyRucExists && !companyRucExists.is_deleted && id !== companyRucExists.id)
                    throw CustomError.badRequest('Company already exists');
                if (companyRucExists && companyRucExists.is_deleted)
                    throw CustomError.badRequest(
                        'Cannot use this ruc. It belongs to a deleted record'
                    );
            }
            const updatedCompany = await prisma.companies.update({
                where: {
                    id: id,
                },
                data: {
                    type: updateCompanyDto.type,
                    names: updateCompanyDto.names,
                    lastnames: updateCompanyDto.lastnames,
                    ruc: updateCompanyDto.ruc,
                    landline: updateCompanyDto.landline,
                    mobile_phone: updateCompanyDto.mobilePhone,
                    fk_province_id: updateCompanyDto.provinceId
                        ? +updateCompanyDto.provinceId
                        : undefined,
                    fk_city_id: updateCompanyDto.cityId ? +updateCompanyDto.cityId : undefined,
                    address: updateCompanyDto.address,
                    description: updateCompanyDto.description,
                },
                select: selectedFields,
            });
            return updatedCompany;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async deleteCompanyById(id: number): Promise<any> {
        try {
            const companyExists = await prisma.companies.findFirst({
                where: {
                    id: id,
                    is_deleted: false,
                },
            });
            if (!companyExists) throw CustomError.notFound('Record not found');
            const deletedCompany = await prisma.companies.update({
                where: {
                    id: id,
                },
                data: { is_deleted: true },
                select: selectedFields,
            });
            return deletedCompany;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }
}
