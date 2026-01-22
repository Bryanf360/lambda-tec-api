import { Router } from 'express';

import { UserController } from '../controllers';
import { UserService } from '../services';

export class UserRoutes {
    static get routes(): Router {
        const router = Router();
        const userService = new UserService();
        const userController = new UserController(userService);
        router.post('/', userController.createUser);
        router.get('/', userController.getUsers);
        router.get('/:id', userController.getUserById);
        router.put('/:id', userController.updateUserById);
        router.delete('/:id', userController.deleteUserById);
        return router;
    }
}
