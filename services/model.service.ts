import { CreateModelDto, PaginationDto, UpdateModelDto } from '../dtos';
import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

const selectFields = {
    id: true,
    name: true,
    description: true,
    brand: {
        select: {
            id: true,
            name: true,
            description: true,
        },
    },
};

export class ModelService {
    async getModels(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        try {
            const [total, models] = await Promise.all([
                prisma.models.count(),
                prisma.models.findMany({
                    where: {
                        is_deleted: false,
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    select: selectFields,
                }),
            ]);
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev: page - 1 > 0 ? `/api/models?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/models?page=${page + 1}&limit=${limit}`,
                },
                data: models,
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    async getModelsByBrandId(brandId: number, paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        const where = {
            is_deleted: false,
            fk_brand_id: brandId,
        };
        try {
            const brandExists = await prisma.brands.findFirst({
                where: {
                    id: brandId,
                    is_deleted: false,
                },
            });
            if (!brandExists) throw CustomError.notFound('Brand not found');
            const [total, models] = await Promise.all([
                prisma.models.count({ where }),
                prisma.models.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    select: selectFields,
                }),
            ]);
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev:
                        page - 1 > 0
                            ? `/api/brands/${brandId}/models?page=${page - 1}&limit=${limit}`
                            : null,
                    next: `/api/brands/${brandId}/models?page=${page + 1}&limit=${limit}`,
                },
                data: models,
            };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer(`${error}`);
        }
    }

    async createModel(createModelDto: CreateModelDto): Promise<any> {
        const [modelExists, brandExists] = await Promise.all([
            prisma.models.findFirst({
                where: {
                    name: createModelDto.name,
                    fk_brand_id: createModelDto.brandId,
                    is_deleted: false,
                },
            }),
            prisma.brands.findFirst({
                where: {
                    id: createModelDto.brandId,
                    is_deleted: false,
                },
            }),
        ]);
        if (modelExists) throw CustomError.badRequest('Model already exists');
        if (!brandExists) throw CustomError.badRequest('Brand id is no exists');
        const deletedModel = await prisma.models.findFirst({
            where: {
                name: createModelDto.name,
                fk_brand_id: createModelDto.brandId,
                is_deleted: true,
            },
        });
        try {
            if (deletedModel) {
                const reactivatedModel = await prisma.models.update({
                    where: {
                        id: deletedModel.id,
                    },
                    select: selectFields,
                    data: {
                        is_deleted: false,
                    },
                });
                return reactivatedModel;
            }
            const createdModel = await prisma.models.create({
                select: selectFields,
                data: {
                    name: createModelDto.name,
                    description: createModelDto.description,
                    fk_brand_id: createModelDto.brandId,
                },
            });
            return createdModel;
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    async updateModelById(id: number, updateModelDto: UpdateModelDto): Promise<any> {
        const [modelExists, modelNameExists] = await Promise.all([
            prisma.models.findFirst({
                where: {
                    id: id,
                    is_deleted: false,
                },
            }),
            prisma.models.findFirst({
                where: {
                    name: updateModelDto.name,
                    fk_brand_id: updateModelDto.brandId,
                    is_deleted: false,
                },
            }),
        ]);
        if (!modelExists) throw CustomError.notFound('Model not found');
        if (modelNameExists && id != modelNameExists.id)
            throw CustomError.badRequest('Model already exists');
        const brandExists = await prisma.models.findFirst({
            where: {
                id: updateModelDto.brandId,
                is_deleted: false,
            },
        });
        if (!brandExists) throw CustomError.notFound('Brand not found');
        try {
            const updatedModel = await prisma.models.update({
                where: {
                    id: id,
                },
                select: selectFields,
                data: {
                    fk_brand_id: updateModelDto.brandId,
                    name: updateModelDto.name,
                    description: updateModelDto.description,
                },
            });
            return updatedModel;
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    async deleteModelById(id: number): Promise<any> {
        const modelExists = await prisma.models.findFirst({
            where: {
                id: id,
                is_deleted: false,
            },
        });
        if (!modelExists) throw CustomError.notFound('Model not found');
        try {
            const updatedModel = await prisma.models.update({
                where: {
                    id: id,
                },
                select: selectFields,
                data: {
                    is_deleted: true,
                },
            });
            return updatedModel;
        } catch (error) {
            throw CustomError.internalServer('Internal server error');
        }
    }
}
