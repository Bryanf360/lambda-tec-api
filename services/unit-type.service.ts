import { unit_types as UnitType } from "@prisma/client";

import { CreateUnitTypeDto, PaginationDto, UpdateUnitTypeDto } from "../dtos";
import { prisma } from "../prisma/client";
import { CustomError } from "../utils";

const selectedFields = {
    id: true,
    name: true,
    simbol: true,
    description: true
}

export class UnitTypeService {

    public async createUnitType(createUnitTypeDto: CreateUnitTypeDto): Promise<Pick<UnitType, 'id' | 'name' | 'simbol' | 'description'>> {
        try {
            const unitTypeExists = await prisma.unit_types.findFirst({
                where: {
                    name: createUnitTypeDto.name
                }
            });
            if (unitTypeExists && !unitTypeExists.is_deleted) throw CustomError.badRequest('Unit type already exists');
            if (unitTypeExists && unitTypeExists.is_deleted) throw CustomError.badRequest('Cannot use this name. It belongs to a deleted record');
            const createdUnitType = await prisma.unit_types.create({
                data: createUnitTypeDto,
                select: selectedFields
            });
            return createdUnitType;
        } catch(error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async getUnitTypes(paginationDto: PaginationDto): Promise<any> {
        const { page, limit } = paginationDto;
        try {
            const [total, unitTypes] = await Promise.all([
                prisma.unit_types.count({
                    where: {
                        is_deleted: false
                    }
                }),
                prisma.unit_types.findMany({
                    where: {
                        is_deleted: false
                    },
                    select: selectedFields,
                    skip: (page - 1) * limit,
                    take: limit
                })
            ]);
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev: (page - 1 > 0) ? `/api/unit-types?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/unit-types?page=${page + 1}&limit=${limit}`
                },
                data: unitTypes
            }
        } catch(error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async updateUnitTypeById(id: number, updateUnitTypeDto: UpdateUnitTypeDto): Promise<any> {
        let unitTypeNameExists = undefined;
        try {
            const unitTypeExists = await prisma.unit_types.findFirst({
                where: {
                    id: id,
                    is_deleted: false
                }
            });
            if (!unitTypeExists) throw CustomError.notFound('Unit type not found');
            if (updateUnitTypeDto.name) {
                unitTypeNameExists = await prisma.unit_types.findFirst({
                    where: {
                        name: updateUnitTypeDto.name,
                    }
                });
            }
            if (unitTypeNameExists && !unitTypeNameExists?.is_deleted && id !== unitTypeNameExists.id) throw CustomError.badRequest('Unit type already exists');
            if (unitTypeNameExists && unitTypeNameExists?.is_deleted) throw CustomError.badRequest('Cannot use this name. It belongs to a deleted record');
            const updatedUnitType = await prisma.unit_types.update({
                where: {
                    id: id,
                },
                select: selectedFields,
                data: updateUnitTypeDto.values
            });
            return updatedUnitType;
        } catch(error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async deleteUnitTypeById(id: number): Promise<Pick<UnitType, 'name' | 'simbol' | 'description'>> {
        try {
            const unitTypeExists = await prisma.unit_types.findFirst({ 
                where: { 
                    id: id,
                    is_deleted: false
                }
            });
            if (!unitTypeExists) throw CustomError.notFound('Unit type not found');
            const deletedUnitType = await prisma.unit_types.update({
                where: {
                    id: id
                },
                select: selectedFields,
                data: { is_deleted: true }
            });
            return deletedUnitType;
        } catch(error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }
}