import { Request, Response } from "express";

import { handleError } from "../utils/handle.error";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {

    constructor(public dashboardService: DashboardService) {}

    public getDashboardStats = (req: Request, res: Response) => {
        this.dashboardService.getDashboardStats()
            .then(result => res.status(200).json({
                success: true,
                message: 'Dashboard data fetched successfully',
                data: result
            }))
            .catch(error => handleError(error, res));
    }
}