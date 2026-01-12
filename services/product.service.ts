import { Prisma, products as Product } from '@prisma/client';
import { CreateProductDto, PaginationDto, UpdateProductDto } from '../dtos';
import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

const selectedFields = {
    id: true,
    type: true,
    name: true,
    description: true,
    brand: {
        select: {
            id: true,
            name: true,
            description: true,
        },
    },
    model: {
        select: {
            id: true,
            name: true,
            description: true,
        },
    },
    part_number: {
        select: {
            id: true,
            name: true,
            description: true,
        },
    },
    unit_type: {
        select: {
            id: true,
            name: true,
            description: true,
            simbol: true,
        },
    },
};

export class ProductService {
    public async createProduct(createProductDto: CreateProductDto): Promise<any> {
        try {
            const [brandExists, modelExists, partNumberExists, unitTypeExists, productNameExists] =
                await Promise.all([
                    prisma.brands.findFirst({
                        where: {
                            id: createProductDto.brandId,
                        },
                    }),
                    prisma.models.findFirst({
                        where: {
                            id: createProductDto.modelId,
                        },
                    }),
                    prisma.part_numbers.findFirst({
                        where: {
                            id: createProductDto.partNumberId,
                        },
                    }),
                    prisma.unit_types.findFirst({
                        where: {
                            id: createProductDto.unitTypeId,
                        },
                    }),
                    prisma.products.findFirst({
                        where: {
                            name: createProductDto.name,
                        },
                    }),
                ]);

            if (!brandExists) throw CustomError.notFound('Brand not found');
            if (brandExists && brandExists.is_deleted)
                throw CustomError.badRequest('Brand has be deleted');
            if (!modelExists) throw CustomError.notFound('Model not found');
            if (modelExists && modelExists.is_deleted)
                throw CustomError.badRequest('Model has be deleted');
            if (!partNumberExists) throw CustomError.notFound('Part number not found');
            if (partNumberExists && partNumberExists.is_deleted)
                throw CustomError.badRequest('Part number has be deleted');
            if (!unitTypeExists) throw CustomError.notFound('Unit type not found');
            if (unitTypeExists && unitTypeExists.is_deleted)
                throw CustomError.badRequest('Unit type has be deleted');
            if (productNameExists && !productNameExists.is_deleted)
                throw CustomError.badRequest('Product already exists');
            if (productNameExists && productNameExists.is_deleted)
                throw CustomError.badRequest(
                    'Cannot use this name. It belongs to a deleted record'
                );

            const createdProduct = await prisma.products.create({
                data: {
                    type: createProductDto.type,
                    name: createProductDto.name,
                    description: createProductDto.description,
                    fk_brand_id: createProductDto.brandId,
                    fk_model_id: createProductDto.modelId,
                    fk_part_number_id: createProductDto.partNumberId,
                    fk_unit_type: createProductDto.unitTypeId,
                },
                select: selectedFields,
            });
            return createdProduct;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async getProducts(search: string, paginationDto: PaginationDto): Promise<any> {
        const { page, limit } = paginationDto;
        const typeTranslations = {
            equipo: 'equipment',
            equip: 'equipment', // 👈 soporta búsqueda parcial
            consumible: 'consumable',
            consum: 'consumable', // 👈 soporta búsqueda parcial
        };

        const lowerSearch = search.toLowerCase();
        const translatedType = Object.entries(typeTranslations).find(([key]) =>
            lowerSearch.includes(key)
        )?.[1];

        const where = search
            ? {
                  OR: [
                      ...(translatedType
                          ? [{ type: { equals: translatedType } } as Prisma.productsWhereInput]
                          : []),
                      { name: { contains: search } },
                      { description: { contains: search } },
                      { unit_type: { is: { name: { contains: search } } } },
                  ],
              }
            : {};

        try {
            const [total, products] = await Promise.all([
                prisma.products.count({
                    where: {
                        ...where,
                        is_deleted: false,
                    },
                }),
                prisma.products.findMany({
                    where: {
                        ...where,
                        is_deleted: false,
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    select: selectedFields,
                }),
            ]);
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev: page - 1 > 0 ? `/api/products?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/products?page=${page + 1}&limit=${limit}`,
                },
                data: products,
            };
        } catch (error) {
            console.log('error: ', error);
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async getProductStocks(search: string, paginationDto: PaginationDto): Promise<any> {
        const { page, limit } = paginationDto;
        const typeTranslations = {
            equipo: 'equipment',
            equip: 'equipment', // 👈 soporta búsqueda parcial
            consumible: 'consumable',
            consum: 'consumable', // 👈 soporta búsqueda parcial
        };

        const lowerSearch = search.toLowerCase();
        const translatedType = Object.entries(typeTranslations).find(([key]) =>
            lowerSearch.includes(key)
        )?.[1];

        const where = search
            ? {
                  OR: [
                      ...(translatedType
                          ? [{ type: { equals: translatedType } } as Prisma.productsWhereInput]
                          : []),
                      { name: { contains: search } },
                      { description: { contains: search } },
                      { brand: { is: { name: { contains: search } } } },
                      { model: { is: { name: { contains: search } } } },
                      { part_number: { is: { name: { contains: search } } } },
                      { unit_type: { is: { name: { contains: search } } } },
                  ],
              }
            : {};
        try {
            const [total, products] = await Promise.all([
                prisma.products.count({
                    where: {
                        ...where,
                        // TODO: validate the meaning of the status field and is_deleted field
                        is_deleted: false,
                    },
                }),
                prisma.products.findMany({
                    where: {
                        ...where,
                        is_deleted: false,
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    select: { ...selectedFields, status: true },
                }),
            ]);

            const movementDetails = await prisma.movement_details.findMany({
                select: {
                    fk_product_id: true,
                    quantity: true,
                    movements: {
                        select: { type: true },
                    },
                },
            });

            const stockMap = new Map<number, number>();

            for (const movementDetail of movementDetails) {
                const sign = movementDetail.movements.type === 'input' ? 1 : -1;
                stockMap.set(
                    movementDetail.fk_product_id,
                    (stockMap.get(movementDetail.fk_product_id) ?? 0) +
                        sign * movementDetail.quantity
                );
            }

            const productsWithStock = products.map((product) => ({
                ...product,
                stock: stockMap.get(product.id) ?? 0,
            }));
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev:
                        page - 1 > 0
                            ? `/api/products/stocks?page=${page - 1}&limit=${limit}`
                            : null,
                    next: `/api/products/stocks?page=${page + 1}&limit=${limit}`,
                },
                data: productsWithStock,
            };
        } catch (error) {
            console.log('error: ', error);
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async updateProductById(id: number, updateProductDto: UpdateProductDto): Promise<any> {
        let productNameExists = undefined;
        try {
            const productExists = await prisma.products.findFirst({
                where: {
                    id: id,
                    is_deleted: false,
                },
            });
            if (updateProductDto.name) {
                productNameExists = await prisma.products.findFirst({
                    where: {
                        name: updateProductDto.name,
                    },
                });
            }
            if (!productExists) throw CustomError.notFound('Product not found');
            if (productNameExists && !productNameExists.is_deleted && id !== productExists.id)
                throw CustomError.badRequest('Product already exists');
            if (productNameExists && productNameExists.is_deleted)
                throw CustomError.badRequest(
                    'Cannot use this name. It belongs to a deleted record'
                );
            if (updateProductDto.brandId) {
                const brandExists = await prisma.brands.findFirst({
                    where: {
                        id: updateProductDto.brandId,
                        is_deleted: false,
                    },
                });
                if (!brandExists) throw CustomError.notFound('Brand not found');
            }
            if (updateProductDto.modelId) {
                const modelExists = await prisma.models.findFirst({
                    where: {
                        id: updateProductDto.modelId,
                        is_deleted: false,
                    },
                });
                if (!modelExists) throw CustomError.notFound('Model not found');
            }
            if (updateProductDto.partNumberId) {
                const partNumberExists = await prisma.part_numbers.findFirst({
                    where: {
                        id: updateProductDto.partNumberId,
                        is_deleted: false,
                    },
                });
                if (!partNumberExists) throw CustomError.notFound('Part number not found');
            }
            if (updateProductDto.uniTypeId) {
                const unitTypeExists = await prisma.unit_types.findFirst({
                    where: {
                        id: updateProductDto.uniTypeId,
                        is_deleted: false,
                    },
                });
                if (!unitTypeExists) throw CustomError.notFound('Unit type not found');
            }
            const updatedProduct = await prisma.products.update({
                where: {
                    id: id,
                },
                data: {
                    type: updateProductDto.type,
                    name: updateProductDto.name,
                    description: updateProductDto.description,
                    fk_brand_id: updateProductDto.brandId,
                    fk_model_id: updateProductDto.modelId,
                    fk_part_number_id: updateProductDto.partNumberId,
                    fk_unit_type: updateProductDto.uniTypeId,
                },
                select: selectedFields,
            });
            return updatedProduct;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async deleteProductById(id: number): Promise<any> {
        try {
            const productExists = await prisma.products.findFirst({
                where: {
                    id: id,
                    is_deleted: false,
                },
            });
            if (!productExists) throw CustomError.notFound('Product not found');
            const deletedProduct = await prisma.products.update({
                where: {
                    id: id,
                },
                data: { is_deleted: true },
                select: selectedFields,
            });
            return deletedProduct;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Internal server error');
        }
    }
}
