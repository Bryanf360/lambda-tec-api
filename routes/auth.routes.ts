import { Router } from "express";

import { AuthController } from "../controllers";
import { AuthService } from "../services";
import { AuthMiddlware } from "../middlewares";

export class AuthRoutes {

    static get routes(): Router {
        const router = Router();
        // const emailService = new EmailService(envs.MAILER_SERVICE, envs.MAILER_EMAIL, envs.MAILER_SECRET_KEY);
        const authService = new AuthService();
        const authController = new AuthController(authService);

        router.post('/login', authController.login);
        router.post('/register', authController.register);
        router.get('/renew', AuthMiddlware.validateJWT, authController.revalidateToken);
        return router;
    }
}