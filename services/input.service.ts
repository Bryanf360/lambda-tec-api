import { CreateInputDto } from '../dtos/create-input.dto';
import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

export class InputService {
    async createInput(createInputDto: CreateInputDto) {
        return prisma.$transaction(async (tx) => {
            const movement = await tx.movements.create({
                data: {
                    type: createInputDto.type,
                    fk_provider_id: createInputDto.providerId ?? null,
                    date: createInputDto.date,
                    code: createInputDto.code,
                    fk_reason_id: createInputDto.reasonId,
                    group_code: createInputDto.groupCode,
                },
            });

            // 2️⃣ Procesar detalles
            for (const detail of createInputDto.details) {
                // Normalizar instances (evita null/undefined)
                const instances = detail.instances ?? [];

                // 2.1️⃣ Obtener tipo de producto (fuente de verdad)
                const product = await tx.products.findUnique({
                    where: { id: detail.productId },
                    select: { type: true },
                });

                if (!product) {
                    throw CustomError.badRequest(`El producto ${detail.productId} no existe`);
                }

                const isEquipment = product.type === 'equipment';

                // 2.2️⃣ Reglas por tipo
                if (isEquipment) {
                    if (instances.length === 0) {
                        throw CustomError.badRequest(
                            'Los productos tipo equipo requieren instancias'
                        );
                    }
                    if (detail.quantity !== instances.length) {
                        throw CustomError.badRequest('La cantidad no coincide con las instancias');
                    }
                } else {
                    // Consumible
                    if (instances.length > 0) {
                        throw CustomError.badRequest(
                            'Los productos consumibles no manejan instancias'
                        );
                    }
                }

                // 2.3️⃣ Crear movement_detail
                const movementDetail = await tx.movement_details.create({
                    data: {
                        fk_movement_id: movement.movement_id,
                        fk_product_id: detail.productId,
                        fk_warehouse_id: detail.warehouseId,
                        quantity: detail.quantity,
                    },
                });

                // 2.4️⃣ Crear instancias SOLO si es equipo
                if (isEquipment) {
                    await tx.product_instances.createMany({
                        data: instances.map((productInstance) => ({
                            fk_movement_detail_id: movementDetail.movement_detail_id,
                            fk_product_id: detail.productId,
                            fk_warehouse_id: detail.warehouseId,
                            serial_number: productInstance.serialNumber,
                            asset_number: productInstance.assetNumber,
                            status: productInstance.status,
                        })),
                    });
                }
            }
            return { movementId: movement.movement_id };
        });
    }

    /*
    async getBrands(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        try {
            const [total, brands] = await Promise.all([
                prisma.brands.count({
                    where: {
                        is_deleted: false,
                    },
                }),
                prisma.brands.findMany({
                    where: {
                        is_deleted: false,
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                }),
            ]);
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev: page != 1 ? `/api/brands?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/brands?page=${page + 1}&limit=${limit}`,
                },
                data: brands,
            };
        } catch (error) {
            throw CustomError.internalServer('Internal server error');
        }
    }

    async getBrandById(id: number) {
        const brandExists = await prisma.brands.findFirst({
            where: {
                id: id,
                is_deleted: false,
            },
            select: {
                id: true,
                name: true,
                description: true,
            },
        });
        if (!brandExists) throw CustomError.notFound(`Brand with id ${id} not found`);
        return brandExists;
    }

    async updateBrandById(id: number, updateBrandDto: UpdateBrandDto) {
        const brandExists = await prisma.brands.findFirst({
            where: {
                id: id,
                is_deleted: false,
            },
        });
        if (!brandExists) throw CustomError.notFound(`Brand with id ${id} not found`);
        const brandNameExists = await prisma.brands.findFirst({
            where: {
                name: updateBrandDto.name,
                is_deleted: false,
            },
        });
        if (brandNameExists && id != brandNameExists.id)
            throw CustomError.badRequest('Brand already exists');
        try {
            const updatedBrand = await prisma.brands.update({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                },
                data: updateBrandDto.values,
            });
            return updatedBrand;
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    async deleteBrandById(id: number) {
        const brandExists = await prisma.brands.findFirst({
            where: {
                id: id,
                is_deleted: false,
            },
        });
        if (!brandExists) throw CustomError.notFound(`Brand with id ${id} not found`);
        try {
            const deletedBrand = await prisma.brands.update({
                where: {
                    id: id,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                },
                data: { is_deleted: true },
            });
            return deletedBrand;
        } catch (error) {
            throw CustomError.internalServer(` ${error} `);
        }
    }
        */
}
