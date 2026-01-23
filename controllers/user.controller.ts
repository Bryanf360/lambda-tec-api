import { Request, Response } from 'express';
import { PaginationDto, RegisterUserDto, UpdateUserDto } from '../dtos';
import { prisma } from '../prisma/client';
import { UserService } from '../services';
import { CustomError } from '../utils';
export class UserController {
    constructor(public readonly userService: UserService) {}

    public getUsers = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 10 } = req.query;
        const [error, paginationDto] = PaginationDto.create(+page, +limit);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.userService
            .getUsers(paginationDto!)
            .then((result) =>
                res.status(200).json({
                    success: true,
                    ...result,
                })
            )
            .catch((error) => this.handleError(error, res));
    };

    public getUserById = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        if (isNaN(+id)) res.json({ error: 'Number ID no valid!' });
        const user = await prisma.users.findFirst({
            where: {
                user_id: +id,
            },
        });
        if (!user) res.status(404).json({ error: `User with id ${id} not found!` });
        res.json(user);
    };

    public createUser = async (req: Request, res: Response): Promise<any> => {
        const [error, registerUserDto] = RegisterUserDto.create(req.body);
        if (error) return res.status(400).json({ error });
        this.userService
            .createUser(registerUserDto!)
            .then((result) =>
                res.json({
                    success: true,
                    message: 'User registered succesfully',
                    data: result,
                })
            )
            .catch((error) => this.handleError(error, res));
    };

    public updateUserById = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        const [error, updatedUserDto] = UpdateUserDto.create(req.body);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.userService
            .updateUserById(+id, updatedUserDto!)
            .then((user) =>
                res.status(200).json({
                    success: true,
                    message: 'Usuario actualizado exitosamente',
                    data: user,
                })
            )
            .catch((error) => this.handleError(error, res));
    };

    public deleteUserById = async (req: Request, res: Response): Promise<any> => {
        const { id } = req.params;
        this.userService
            .deleteUserById(+id)
            .then((user) =>
                res.status(200).json({
                    success: true,
                    message: 'Usuario inactivado exitosamente',
                    data: user,
                })
            )
            .catch((error) => this.handleError(error, res));
    };

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error: error.error,
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'InternalServerError',
        });
    };
}
