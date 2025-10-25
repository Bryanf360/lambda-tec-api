import { CreateCityDto, PaginationDto } from '../dtos';
import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

export class CityService {
    async createCity(createCityDto: CreateCityDto) {
        const cityExists = await prisma.cities.findFirst({
            where: {
                name: createCityDto.name,
                fk_province_id: createCityDto.provinceId,
            },
        });
        if (cityExists) throw CustomError.badRequest('City already exists');
        const provinceExists = await prisma.provinces.findFirst({
            where: {
                id: createCityDto.provinceId,
            },
        });
        if (!provinceExists) throw CustomError.badRequest('Province is not exists');
        try {
            const createdCity = await prisma.cities.create({
                data: {
                    name: createCityDto.name,
                    description: createCityDto.description,
                    fk_province_id: createCityDto.provinceId,
                },
            });
            return createdCity;
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    async getCities(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        try {
            const [total, cities] = await Promise.all([
                prisma.cities.count(),
                prisma.cities.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                    select: {
                        fk_province_id: false,
                        id: true,
                        name: true,
                        description: true,
                        province: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                }),
            ]);
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev: page - 1 > 0 ? `/api/cities?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/cities/page=${page + 1}&limit=${limit}`,
                },
                data: cities,
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    async getCitiesByProvinceId(provinceId: number, paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        const where = {
            fk_province_id: provinceId,
        };
        try {
            const [total, cities] = await Promise.all([
                prisma.cities.count({ where }),
                prisma.cities.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    select: {
                        fk_province_id: false,
                        id: true,
                        name: true,
                        description: true,
                        province: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                }),
            ]);
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev:
                        page - 1 > 0
                            ? `/api/provinces/${provinceId}/cities?page=${page - 1}&limit=${limit}`
                            : null,
                    next: `/api/provinces/${provinceId}/cities/page=${page + 1}&limit=${limit}`,
                },
                data: cities,
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }
}
