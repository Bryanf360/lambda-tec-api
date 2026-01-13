import { Router } from 'express';

import { CompanyService } from '../services';
import { CompanyController } from '../controllers';
import { AuthMiddlware, ValidateIdMiddlware } from '../middlewares';

export class CompanyRoutes {
    static get routes(): Router {
        const router = Router();
        const companyService = new CompanyService();
        const companyController = new CompanyController(companyService);
        router.post('/', AuthMiddlware.validateJWT, companyController.createCompany);
        router.get('/:type', AuthMiddlware.validateJWT, companyController.getCompanies);
        router.put(
            '/:id',
            [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId],
            companyController.updateCompany
        );
        router.delete(
            '/:id',
            [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId],
            companyController.deleteCompany
        );
        return router;
    }
}
