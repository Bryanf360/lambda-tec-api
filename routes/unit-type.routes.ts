import { Router } from "express";

import { AuthMiddlware, ValidateIdMiddlware } from "../middlewares";
import { UnitTypeService } from "../services";
import { UnitTypeController } from "../controllers";

export class UnitTypeRoutes {

    static get routes(): Router { 
        const router = Router();
        const unitTypeService = new UnitTypeService()
        const unitTypeController = new UnitTypeController(unitTypeService);
        router.post('/', [AuthMiddlware.validateJWT], unitTypeController.createUnitType)
        router.get('/', unitTypeController.getUnitTypes)
        router.put('/:id', [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId], unitTypeController.updateUnitType)
        router.delete('/:id', [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId], unitTypeController.deleteUnitType)
        return router;
    }
}