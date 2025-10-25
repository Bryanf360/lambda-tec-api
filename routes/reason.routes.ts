import { Router } from 'express';

import { ReasonService } from '../services';
import { ReasonController } from '../controllers';
import { AuthMiddlware, ValidateIdMiddlware } from '../middlewares';
import { ValidateParamMiddlware } from '../middlewares/validate-param.middlware';

export class ReasonRoutes {
    static get routes(): Router {
        const router = Router();
        const reasonService = new ReasonService();
        const reasonController = new ReasonController(reasonService);
        router.post('/', [AuthMiddlware.validateJWT], reasonController.createReason);
        router.get(
            '/type/:type',
            ValidateParamMiddlware.validateType,
            reasonController.getReasonsByType
        );
        router.put(
            '/:id',
            [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId],
            reasonController.updateReason
        );
        router.delete(
            '/:id',
            [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId],
            reasonController.deleteReason
        );
        return router;
    }
}
