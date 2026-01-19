import { PaginationDto } from '../dtos';
import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

export class ReportService {
    async getInstances(paginationDto: PaginationDto) {
        const { page, limit, dateFrom, dateTo } = paginationDto;
        const parseLocalDate = (dateStr: string) => {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
        };
        const where: any = {};

        if (dateFrom || dateTo) {
            where.created_at = {};

            if (dateFrom) {
                where.created_at.gte = parseLocalDate(dateFrom);
            }

            if (dateTo) {
                const end = parseLocalDate(dateTo);
                end.setHours(23, 59, 59, 999);
                where.created_at.lte = end;
            }
        }

        try {
            const [instances, total] = await Promise.all([
                prisma.product_instances.findMany({
                    where,
                    include: {
                        products: {
                            include: {
                                brand: true,
                                model: true,
                                part_number: true,
                                unit_type: true,
                            },
                        },
                        warehouses: true,
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: {
                        created_at: 'desc',
                    },
                }),
                prisma.product_instances.count({ where }),
            ]);

            const data = instances.map((instance) => ({
                id: instance.product_instance_id,
                type: instance.products.type === 'equipment' ? 'Equipo' : 'Consumible',
                name: instance.products.name,
                description: instance.products.description,
                brand: instance.products.brand?.name || '',
                model: instance.products.model?.name || '',
                partNumber: instance.products.part_number?.name || '',
                unitType: instance.products.unit_type
                    ? `${instance.products.unit_type.simbol} - ${instance.products.unit_type.name}`
                    : '',
                serialNumber: instance.serial_number || '',
                assetNumber: instance.asset_number || '',
                warehouse: instance.warehouses?.name || '-',
                status: instance.operational_status === 'available' ? 'Disponible' : 'Fuera',
                createdAt: instance.created_at,
            }));

            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev:
                        page != 1 ? `/api/reports/instances?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/reports/instances?page=${page + 1}&limit=${limit}`,
                },
                data: data,
            };
        } catch (error) {
            console.error(error);
            throw CustomError.internalServer('Error interno del servidor');
        }
    }
}
