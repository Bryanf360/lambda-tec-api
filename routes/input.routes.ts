import { Router } from 'express';

import { AuthMiddlware } from '../middlewares';
import { InputService } from '../services/input.service';
import { InputController } from '../controllers/input.controller';

export class InputRoutes {
    static get routes(): Router {
        const router = Router();

        const inputService = new InputService();
        const inputController = new InputController(inputService);

        router.post('/', inputController.createInput);
        return router;
    }
}
