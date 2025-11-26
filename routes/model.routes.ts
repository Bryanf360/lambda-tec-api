import { Router } from "express";
import { ModelService } from "../services/model.service";
import { ModelController } from "../controllers/model.controller";
import { AuthMiddlware, ValidateIdMiddlware } from "../middlewares";
import { PartNumberController } from "../controllers";
import { PartNumberService } from "../services";

export class ModelRoutes {
    static get routes(): Router {
        const router = Router();
        const modelService = new ModelService();
        const partNumberService = new PartNumberService();
        const partNumberController = new PartNumberController(partNumberService);
        const modelController = new ModelController(modelService);
        router.get('/', modelController.getModels);
        router.get('/:modelId/part-numbers', ValidateIdMiddlware.validateIdParam("modelId"), partNumberController.getPartNumbersByModel);
        router.post('/', [AuthMiddlware.validateJWT], modelController.createModel);
        router.put('/:id', [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId], modelController.updateModel)
        router.delete('/:id', [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId], modelController.deleteModel)
        return router;
    }
}