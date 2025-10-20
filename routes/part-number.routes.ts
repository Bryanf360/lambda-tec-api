import { Router } from "express";
import { AuthMiddlware, ValidateIdMiddlware } from "../middlewares";
import { PartNumberController } from "../controllers";
import { PartNumberService } from "../services";

export class PartNumberRoutes {

    static get routes(): Router {
        const router = Router();
        const partNumberService = new PartNumberService();
        const partNumberController = new PartNumberController(partNumberService);
        router.post('/', [AuthMiddlware.validateJWT], partNumberController.createPartNumber)
        router.get('/', partNumberController.getPartNumbers)
        router.put('/:id', [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId], partNumberController.updatePartNumber)
        router.delete('/:id', [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId], partNumberController.deletedPartNumber)
        return router;
    }
}