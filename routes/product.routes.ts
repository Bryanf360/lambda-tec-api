import { Router } from 'express';
import { AuthMiddlware, ValidateIdMiddlware } from '../middlewares';
import { ProductController } from '../controllers';
import { ProductService } from '../services';

export class ProductRoutes {
    static get routes(): Router {
        const router = Router();
        const productService = new ProductService();
        const productController = new ProductController(productService);
        router.post('/', AuthMiddlware.validateJWT, productController.createProduct);
        router.get('/', AuthMiddlware.validateJWT, productController.getProducts);
        router.put(
            '/:id',
            [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId],
            productController.updateProduct
        );
        router.delete(
            '/:id',
            [AuthMiddlware.validateJWT, ValidateIdMiddlware.validateId],
            productController.deleteProduct
        );
        return router;
    }
}
