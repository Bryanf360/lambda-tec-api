import { Router } from "express";
import { AuthMiddlware, ValidateIdMiddlware } from "../middlewares";
import { BrandService } from "../services/brand.service";
import { BrandController } from "../controllers/brand.controller";
import { ModelController } from "../controllers/model.controller";
import { ModelService } from "../services/model.service";

export class BrandRoutes {

    static get routes(): Router {
        const router = Router();
        const brandService = new BrandService();
        const brandController = new BrandController(brandService);
        const modelService = new ModelService();
        const modelController = new ModelController(modelService);
        router.post('/', AuthMiddlware.validateJWT, brandController.createBrand);
        router.get('/', brandController.getBrands);
        router.get('/:brandId/models', ValidateIdMiddlware.validateBrandId, modelController.getModelsByBrandId);
        router.get('/:id', ValidateIdMiddlware.validateId, brandController.getBrandById);
        router.put('/:id', ValidateIdMiddlware.validateId, brandController.updateBrandById);
        router.delete('/:id', brandController.deleteBrandById);
        return router;
    }
}