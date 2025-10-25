import { Router } from 'express';

import { CityService, ProvinceService } from '../services';
import { CityController, ProvinceController } from '../controllers';
import { AuthMiddlware, ValidateIdMiddlware } from '../middlewares';

export class ProvinceRoutes {
    static get routes(): Router {
        const router = Router();
        const provinceService = new ProvinceService();
        const cityService = new CityService();
        const cityController = new CityController(cityService);
        const provinceController = new ProvinceController(provinceService);
        router.post('/', [AuthMiddlware.validateJWT], provinceController.createProvince);
        router.get('/', provinceController.getProvinces);
        router.get(
            '/:provinceId/cities',
            ValidateIdMiddlware.validateIdParam('provinceId'),
            cityController.getCitiesByProvince
        );
        // router.get('/:id', [AuthMiddlware.validateJWT], provinceController.get)
        return router;
    }
}
