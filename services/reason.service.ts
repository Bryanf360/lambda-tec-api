import { reasons as Reason } from '@prisma/client';

import { prisma } from '../prisma/client';
import { CustomError } from '../utils';
import { CreateReasonDto, PaginationDto, UpdateReasonDto } from '../dtos';

const selectFields = {
    id: true,
    type: true,
    name: true,
    description: true,
};

export class ReasonService {
    async createReason(
        createReasonDto: CreateReasonDto
    ): Promise<Pick<Reason, 'id' | 'type' | 'name' | 'description'>> {
        try {
            const reasonExists = await prisma.reasons.findFirst({
                where: {
                    type: createReasonDto.type,
                    name: createReasonDto.name,
                },
            });
            if (reasonExists && !reasonExists.is_deleted)
                throw CustomError.badRequest('Reason already exists');
            if (reasonExists && reasonExists.is_deleted) {
                const reactivatedReason = this.reactivateReason({
                    ...reasonExists,
                    description: createReasonDto.description ?? null,
                });
                return reactivatedReason;
            }
            const createdReason = await prisma.reasons.create({
                data: createReasonDto,
                select: {
                    id: true,
                    type: true,
                    name: true,
                    description: true,
                },
            });
            return createdReason;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    private async reactivateReason(
        reason: Reason
    ): Promise<Pick<Reason, 'id' | 'type' | 'name' | 'description'>> {
        return await prisma.reasons.update({
            where: {
                id: reason.id,
            },
            select: {
                id: true,
                type: true,
                name: true,
                description: true,
            },
            data: {
                description: reason.description,
                is_deleted: false,
            },
        });
    }

    public async getReasons(paginationDto: PaginationDto): Promise<any> {
        const { page, limit } = paginationDto;
        try {
            const [total, reasons] = await Promise.all([
                prisma.reasons.count({
                    where: {
                        is_deleted: false,
                    },
                }),
                prisma.reasons.findMany({
                    where: {
                        is_deleted: false,
                    },
                    select: {
                        id: true,
                        type: true,
                        name: true,
                        description: true,
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
                    prev: page - 1 > 0 ? `/api/reasons?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/reasons?page=${page + 1}&limit=${limit}`,
                },
                data: reasons,
            };
        } catch (error) {
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async updateReasonById(id: number, updateReasonDto: UpdateReasonDto): Promise<any> {
        try {
            const reasonExists = await prisma.reasons.findFirst({
                where: {
                    id: id,
                    is_deleted: false,
                },
            });
            if (!reasonExists) throw CustomError.notFound('Reason not found');
            const reasonNameExists = await prisma.reasons.findFirst({
                where: {
                    type: updateReasonDto.type,
                    name: updateReasonDto.name,
                },
            });
            if (reasonNameExists && !reasonNameExists.is_deleted)
                throw CustomError.badRequest('Already exists reason');
            if (reasonNameExists && reasonNameExists.is_deleted)
                throw CustomError.badRequest(
                    'Cannot use this name. It belongs to a deleted record'
                );
            const updatedReason = await prisma.reasons.update({
                where: {
                    id: id,
                },
                select: selectFields,
                data: {
                    type: updateReasonDto.type,
                    name: updateReasonDto.name,
                    description: updateReasonDto.description,
                },
            });
            return updatedReason;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async deleteReasonById(id: number): Promise<Reason> {
        try {
            const reasonExists = await prisma.reasons.findFirst({
                where: {
                    id: id,
                    is_deleted: false,
                },
            });
            if (!reasonExists) throw CustomError.notFound('Reason not found');
            const deletedReason = await prisma.reasons.update({
                where: {
                    id: id,
                },
                data: { is_deleted: true },
            });
            return deletedReason;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }
}
