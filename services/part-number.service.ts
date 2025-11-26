import { part_numbers as PartNumber } from '@prisma/client';

import { CreatePartNumberDto, PaginationDto, UpdatePartNumberDto } from '../dtos';
import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

const selectedFields = {
    id: true,
    name: true,
    description: true,
    is_deleted: false,
};

export class PartNumberService {
    async createPartNumber(createPartNumberDto: CreatePartNumberDto): Promise<any> {
        try {
            const modelExists = await prisma.models.findUnique({
                where: { id: createPartNumberDto.modelId, is_deleted: false },
            });
            if (!modelExists) throw CustomError.notFound('Modelo no econtrado');
            const result = await prisma.$transaction(async (tx) => {
                let partNumber = await tx.part_numbers.findUnique({
                    select: selectedFields,
                    where: { name: createPartNumberDto.name },
                });

                if (partNumber && partNumber.is_deleted) {
                    partNumber = await tx.part_numbers.update({
                        select: selectedFields,
                        where: { id: partNumber.id },
                        data: { is_deleted: false },
                    });
                } else if (!partNumber) {
                    partNumber = await tx.part_numbers.create({
                        select: selectedFields,
                        data: {
                            name: createPartNumberDto.name,
                            description: createPartNumberDto.description,
                        },
                    });
                }
                const exists = await tx.models_part_numbers.findUnique({
                    where: {
                        fk_model_id_fk_part_number_id: {
                            fk_model_id: createPartNumberDto.modelId,
                            fk_part_number_id: partNumber.id,
                        },
                    },
                });
                if (exists)
                    throw CustomError.badRequest('Número de parte ya registrado a este modelo');
                await tx.models_part_numbers.create({
                    data: {
                        fk_model_id: createPartNumberDto.modelId,
                        fk_part_number_id: partNumber.id,
                    },
                });
                return partNumber;
            });
            return result;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    async getPartNumbers(paginationDto: PaginationDto): Promise<any> {
        const { page, limit } = paginationDto;
        try {
            const [total, partNumbers] = await Promise.all([
                prisma.part_numbers.count({
                    where: {
                        is_deleted: false,
                    },
                }),
                prisma.part_numbers.findMany({
                    where: {
                        is_deleted: false,
                    },
                    select: selectedFields,
                    skip: (page - 1) * limit,
                    take: limit,
                }),
            ]);
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev: page - 1 > 0 ? `/api/part-numbers?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/part-numbers?page=${page + 1}&limit=${limit}`,
                },
                data: partNumbers,
            };
        } catch (error) {
            throw CustomError.internalServer('Internal server error');
        }
    }

    async getPartNumbersByModelId(modelId: number, paginationDto: PaginationDto): Promise<any> {
        const { page, limit } = paginationDto;
        try {
            const modelExists = await prisma.models.findUnique({
                where: { id: modelId, is_deleted: false },
            });
            if (!modelExists) throw CustomError.notFound('Model not found');

            const [total, partNumbers] = await Promise.all([
                prisma.part_numbers.count({
                    where: {
                        models_part_numbers: { some: { fk_model_id: modelId } },
                        is_deleted: false,
                    },
                }),
                prisma.part_numbers.findMany({
                    select: selectedFields,
                    where: {
                        models_part_numbers: { some: { fk_model_id: modelId } },
                        is_deleted: false,
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
            ]);
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev:
                        page - 1 > 0
                            ? `/api/models/${modelId}/part-numbers?page=${page - 1}&limit=${limit}`
                            : null,
                    next: `/api/models/${modelId}/part-numbers?page=${page + 1}&limit=${limit}`,
                },
                data: partNumbers,
            };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    async updatePartNumberById(id: number, updatePartNumberDto: UpdatePartNumberDto): Promise<any> {
        try {
            const [partNumberExists, partNumberNameExists] = await Promise.all([
                prisma.part_numbers.findFirst({
                    where: {
                        id: id,
                        is_deleted: false,
                    },
                }),
                prisma.part_numbers.findFirst({
                    where: {
                        name: updatePartNumberDto.name,
                    },
                }),
            ]);
            if (!partNumberExists) throw CustomError.notFound('Part number not found');
            if (
                partNumberNameExists &&
                !partNumberNameExists.is_deleted &&
                id !== partNumberNameExists.id
            )
                throw CustomError.badRequest('Part number already exists');
            if (
                partNumberNameExists &&
                partNumberNameExists.is_deleted &&
                id !== partNumberNameExists.id
            )
                throw CustomError.badRequest(
                    'Cannot use this name. It belongs to a deleted record'
                );
            const updatedPartNumber = await prisma.part_numbers.update({
                where: {
                    id: id,
                },
                select: selectedFields,
                data: updatePartNumberDto,
            });
            return updatedPartNumber;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    async deletePartNumberById(
        id: number
    ): Promise<Pick<PartNumber, 'id' | 'name' | 'description'>> {
        try {
            const partNumberExists = await prisma.part_numbers.findFirst({
                where: {
                    id: id,
                    is_deleted: false,
                },
            });
            if (!partNumberExists) throw CustomError.notFound('Part number not found');
            const deletedPartNumber = await prisma.part_numbers.update({
                where: {
                    id: id,
                },
                select: selectedFields,
                data: { is_deleted: true },
            });
            return deletedPartNumber;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }
}
