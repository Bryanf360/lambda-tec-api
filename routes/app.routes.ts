import { Router } from 'express';

import { AuthRoutes } from './auth.routes';
import { DashboardRoutes } from './dashboard.routes';
import { BrandRoutes } from './brand.routes';
import { ModelRoutes } from './model.routes';
import { UnitTypeRoutes } from './unit-type.routes';
import { PartNumberRoutes } from './part-number.routes';
import { ProductRoutes } from './product.routes';
import { ReasonRoutes } from './reason.routes';
import { ProvinceRoutes } from './province.routes';
import { CityRoutes } from './city.routes';
import { CompanyRoutes } from './company.routes';
import { InputRoutes } from './input.routes';

// import { AuthRoutes } from "./auth/routes";
// import { BrandRoutes } from "./brands/routes";
// import { ProvinceRoutes } from "./provinces/routes";
// import { UserRoutes } from "./users/routes";
// import { CityRoutes } from "./city/routes";
// import { ModelRoutes } from "./models/routes";
// import { PartNumberRoutes } from "./part-number/routes";
// import { ReasonRoutes } from "./reasons/routes";
// import { UnitTypeRoutes } from "./unit-types/router";
// import { ProductRoutes } from "./products/router";
// import { CompanyRoutes } from "./company/routes";
// import { WarehouseRoutes } from "./warehouses/routes";

export class AppRoutes {
    static get routes(): Router {
        const router = Router();
        // router.use('/api/users', UserRoutes.routes);
        router.use('/api/auth', AuthRoutes.routes);
        router.use('/api/dashboard', DashboardRoutes.routes);
        router.use('/api/brands', BrandRoutes.routes);
        router.use('/api/models', ModelRoutes.routes);
        router.use('/api/part-numbers', PartNumberRoutes.routes);
        router.use('/api/unit-types', UnitTypeRoutes.routes);
        router.use('/api/products', ProductRoutes.routes);
        router.use('/api/reasons', ReasonRoutes.routes);
        router.use('/api/provinces', ProvinceRoutes.routes);
        router.use('/api/cities', CityRoutes.routes);
        router.use('/api/companies', CompanyRoutes.routes);
        router.use('/api/inputs', InputRoutes.routes);
        // router.use('/api/warehouses', WarehouseRoutes.routes);
        return router;
    }
}
