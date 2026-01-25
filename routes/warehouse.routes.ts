import { Router } from 'express';

import { WarehouseService } from '../services/warehouse.service';
import { WarehouseController } from '../controllers';

export class WarehouseRoutes {
    static get routes(): Router {
        const router = Router();
        const warehouseService = new WarehouseService();
        const warehouseController = new WarehouseController(warehouseService);
        router.get('/', warehouseController.getWarehouses);
        return router;
    }
}
