import { Request, Response } from 'express';

import { ProductService } from '../services';
import { CreateProductDto, PaginationDto, UpdateProductDto } from '../dtos';
import { handleError, normalizeSearch } from '../utils';

export class ProductController {
    constructor(private productService: ProductService) {}

    public createProduct = async (req: Request, res: Response): Promise<any> => {
        const [error, createProductDto] = CreateProductDto.create(req.body);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.productService
            .createProduct(createProductDto!)
            .then((product) =>
                res.status(200).json({
                    success: true,
                    message: 'Product created successfully',
                    data: product,
                })
            )
            .catch((error) => handleError(error, res));
    };

    public getProducts = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 10, search = '' } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        const normalizedSearch: string = normalizeSearch(search);
        this.productService
            .getProducts(normalizedSearch, paginationDto!)
            .then((result) =>
                res.status(200).json({
                    success: true,
                    ...result,
                })
            )
            .catch((error) => handleError(error, res));
    };

    public updateProduct = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        const [error, updateProductDto] = UpdateProductDto.create(req.body);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.productService
            .updateProductById(+id, updateProductDto!)
            .then((product) =>
                res.status(200).json({
                    success: true,
                    message: 'Product updated successfully',
                    data: product,
                })
            )
            .catch((error) => handleError(error, res));
    };

    public deleteProduct = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        this.productService
            .deleteProductById(+id)
            .then((product) =>
                res.status(200).json({
                    success: true,
                    message: 'Product deleted successfully',
                    data: product,
                })
            )
            .catch((error) => handleError(error, res));
    };
}
