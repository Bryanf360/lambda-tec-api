import { Router } from 'express';
import { CityService } from '../services';
import { CityController } from '../controllers';
import { AuthMiddlware } from '../middlewares';

export class CityRoutes {
    static get routes(): Router {
        const router = Router();
        const cityService = new CityService();
        const cityController = new CityController(cityService);
        router.post('/', [AuthMiddlware.validateJWT], cityController.createCity);
        router.get('/', cityController.getCities);
        return router;
    }
}
