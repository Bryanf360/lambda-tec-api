import { Router } from 'express';

import { AuthMiddlware } from '../middlewares';
import { MovementController } from '../controllers/movement.controller';
import { MovementService } from '../services';

export class MovementRoutes {
    static get routes(): Router {
        const router = Router();

        const movementService = new MovementService();
        const movementController = new MovementController(movementService);

        router.post('/input', movementController.createInput);
        router.post('/output', movementController.createOutput);
        return router;
    }
}
