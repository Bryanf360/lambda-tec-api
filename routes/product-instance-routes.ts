import { Router } from 'express';
import { ProductInstanceController } from '../controllers';
import { ProductInstanceService } from '../services';

export class ProductInstanceRoutes {
    static get routes(): Router {
        const router = Router();
        const productInstanceService = new ProductInstanceService();
        const productInstanceController = new ProductInstanceController(productInstanceService);
        router.get('/', productInstanceController.getProductInstancesByProductIdAndWarehouseId);
        return router;
    }
}
