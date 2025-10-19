import { Router } from "express";
import { ModelService } from "../services/model.service";
import { ModelController } from "../controllers/model.controller";
import { AuthMiddlware, ValidateIdMiddlware } from "../middlewares";

export class ModelRoutes {
    static get routes(): Router {
        const router = Router();
        const modelService = new ModelService();
        const modelController = new ModelController(modelService);
        router.get('/', modelController.getModels);
        router.post('/', [AuthMiddlware.validateJWT], modelController.createModel);
        router.put('/:id', [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId], modelController.updateModel)
        router.delete('/:id', [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId], modelController.deleteModel)
        return router;
    }
}