import { CreateBrandDto, PaginationDto, UpdateBrandDto } from '../dtos';
import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

export class ProductInstanceService {
    async getInstancesByProductIdAndWarehouseId(productId: number, warehouseId: number) {
        if (!productId || !warehouseId) {
            throw CustomError.badRequest('ProductId y warehouseId son obligatorios');
        }
        try {
            const instances = await prisma.product_instances.findMany({
                where: {
                    fk_product_id: productId,
                    fk_warehouse_id: warehouseId,
                    operational_status: 'available',
                },
                select: {
                    product_instance_id: true,
                    serial_number: true,
                    asset_number: true,
                },
                orderBy: {
                    product_instance_id: 'asc',
                },
            });

            return { data: instances };
        } catch (error) {
            console.error(error);
            throw CustomError.internalServer('Error interno del servidor');
        }
    }
}
