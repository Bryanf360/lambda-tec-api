import { PaginationDto } from '../dtos';
import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

export class WarehouseService {
    public async getWarehouses(paginationDto: PaginationDto): Promise<any> {
        const { page, limit } = paginationDto;
        try {
            const [total, warehouses] = await Promise.all([
                prisma.warehouses.count(),
                prisma.warehouses.findMany({
                    // where: {

                    // },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
            ]);
            const warehousesToRes = warehouses.map((warehouse) => ({
                id: warehouse.warehouse_id,
                name: warehouse.name,
            }));
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev: page - 1 > 0 ? `/api/warehouses?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/warehouses?page=${page + 1}&limit=${limit}`,
                },
                data: warehousesToRes,
            };
        } catch (error) {
            throw CustomError.internalServer('Internal server error');
        }
    }
}
