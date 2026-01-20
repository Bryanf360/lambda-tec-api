import { Router } from 'express';
import { ReportController } from '../controllers';
import { ReportService } from '../services';

export class ReportRoutes {
    static get routes(): Router {
        const router = Router();
        const reportService = new ReportService();
        const reportController = new ReportController(reportService);
        router.get('/instances', reportController.getInstances);
        router.get('/inputs', reportController.getInputMovementsReport);
        router.get('/inputs/export', reportController.exportInputProductsPdf);
        // TODO: refactor to join inputs and outputs endpoint a one only endpoint
        router.get('/outputs', reportController.getOutputMovementsReport);
        // TODO: refactor to join inputs and outputs reports endpoints
        router.get('/outputs/export', reportController.exportOutputProductsPdf);
        router.get('/instances/export', reportController.exportProductInstancesPdf);
        return router;
    }
}
