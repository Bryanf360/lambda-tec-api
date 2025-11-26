import { prisma } from "../prisma/client";
import { CustomError } from "../utils";

export class DashboardService {

    public async getDashboardStats() {
        try {
            const [productsQuantity, usersQuantity] = await Promise.all([
                prisma.products.count(),
                // prisma.movements.count(),
                prisma.users.count(),
            ]);
            return {
                products_quantity: productsQuantity,
                users_quantity: usersQuantity
            }
        } catch (error) {
            throw CustomError.internalServer(`${error}`)
        }
    }
}