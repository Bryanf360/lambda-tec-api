import { movement_details } from './../node_modules/.prisma/client/index.d';
import { CreateMovementDto } from '../dtos/create-movement.dto';
import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

export class MovementService {
    async createMovement(createMovementDto: CreateMovementDto) {
        return prisma.$transaction(async (tx) => {
            const movement = await tx.movements.create({
                data: {
                    type: 'input',
                    fk_company_id: createMovementDto.companyId ?? null,
                    date: createMovementDto.date,
                    code: createMovementDto.code,
                    fk_reason_id: createMovementDto.reasonId,
                    group_code: createMovementDto.groupCode,
                },
            });

            // 2️⃣ Procesar detalles
            for (const detail of createMovementDto.details) {
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

    async createOutput(createMovementDto: CreateMovementDto) {
        return prisma.$transaction(async (tx) => {
            const [company, reason] = await Promise.all([
                tx.companies.findUnique({
                    where: { id: createMovementDto.companyId },
                }),
                tx.reasons.findUnique({
                    where: { id: createMovementDto.reasonId },
                }),
            ]);

            if (!company) {
                throw CustomError.badRequest(
                    `El cliente con id ${createMovementDto.companyId} no existe`
                );
            }

            if (company.is_deleted) {
                throw CustomError.badRequest(
                    `El cliente con id ${createMovementDto.companyId} actualmente esta deshabilitado`
                );
            }

            if (!company.is_client) {
                throw CustomError.badRequest(
                    `El usuario con id ${createMovementDto.companyId} no es cliente`
                );
            }

            if (!reason) {
                throw CustomError.badRequest(
                    `El motivo con id ${createMovementDto.reasonId} no existe`
                );
            }

            if (reason.is_deleted) {
                throw CustomError.badRequest(
                    `El motivo con id ${createMovementDto.reasonId} actualmente esta deshabilitado`
                );
            }

            if (reason.type !== 'output') {
                throw CustomError.badRequest(
                    `El motivo con id ${createMovementDto.reasonId} no es de salida`
                );
            }

            const movement = await tx.movements.create({
                data: {
                    type: 'output',
                    fk_company_id: createMovementDto.companyId,
                    date: createMovementDto.date,
                    fk_reason_id: createMovementDto.reasonId,
                },
            });
            for (const movementDetail of createMovementDto.details) {
                const stock = await this.getStockByProductId(movementDetail.productId, tx);

                if (movementDetail.quantity > stock) {
                    throw CustomError.badRequest(
                        `Stock insuficiente para el producto con id ${movementDetail.productId}`
                    );
                }
                await tx.movement_details.create({
                    data: {
                        fk_movement_id: movement.movement_id,
                        fk_product_id: movementDetail.productId,
                        fk_warehouse_id: movementDetail.warehouseId,
                        quantity: movementDetail.quantity,
                    },
                });
                if (movementDetail.instanceIds?.length) {
                    for (const instanceId of movementDetail.instanceIds) {
                        const instance = await tx.product_instances.findUnique({
                            where: { product_instance_id: instanceId },
                        });
                        if (!instance)
                            throw CustomError.badRequest(
                                `Instancia de producto con id ${movementDetail.productId} no existe`
                            );
                    }
                    await tx.product_instances.updateMany({
                        where: {
                            product_instance_id: { in: movementDetail.instanceIds },
                        },
                        data: {
                            operational_status: 'out',
                            fk_warehouse_id: null,
                        },
                    });
                }
            }
            return { movementId: movement.movement_id };
        });
    }

    async getStockByProductId(productId: number, tx: any) {
        const details = await tx.movement_details.findMany({
            where: { fk_product_id: productId },
            select: {
                quantity: true,
                movements: { select: { type: true } },
            },
        });

        return details.reduce(
            (acc: number, d: any) =>
                acc + (d.movements.type === 'input' ? d.quantity : -d.quantity),
            0
        );
    }
}
