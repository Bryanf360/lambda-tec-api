import { Router } from 'express';

import { ProvinceService } from '../services';
import { ProvinceController } from '../controllers';
import { AuthMiddlware } from '../middlewares';

export class ProvinceRoutes {
    static get routes(): Router {
        const router = Router();
        const provinceService = new ProvinceService();
        const provinceController = new ProvinceController(provinceService);
        router.post('/', [AuthMiddlware.validateJWT], provinceController.createProvince);
        router.get('/', provinceController.getProvinces);
        // router.get('/:id', [AuthMiddlware.validateJWT], provinceController.get)
        return router;
    }
}
