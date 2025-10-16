import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { DashboardService } from "../services/dashboard.service";

export class DashboardRoutes {

    static get routes(): Router {
        const router = Router();

        const dashboardService = new DashboardService();
        const dashboardController = new DashboardController(dashboardService);
        
        router.get('/', dashboardController.getDashboardStats);
        return router;
    }
}