import { CreateProvinceDto, PaginationDto } from '../dtos';
import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

export class ProvinceService {
    async createProvince(createProvinceDto: CreateProvinceDto) {
        const provinceExists = await prisma.provinces.findFirst({
            where: {
                name: createProvinceDto.name,
            },
        });
        if (provinceExists) throw CustomError.badRequest('Province already exists');
        try {
            const createdProvince = await prisma.provinces.create({
                data: createProvinceDto,
            });
            return createdProvince;
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    async getProvinces(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        try {
            const [total, provinces] = await Promise.all([
                prisma.provinces.count(),
                await prisma.provinces.findMany({
                    skip: (page - 1) * limit,
                    take: limit,
                }),
            ]);
            return {
                meta: {
                    page,
                    limit,
                    total,
                    prev: page - 1 > 0 ? `/api/provinces?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/provinces?page=${page + 1}&limit=${limit}`,
                },
                data: provinces,
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }
}
