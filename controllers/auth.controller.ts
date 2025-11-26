import { Request, Response } from "express";

import { CustomError } from "../utils";
import { LoginUserDto, RegisterUserDto } from "../dtos";
import { JWTAdapter } from "../config";
import { AuthService } from "../services";

export class AuthController {

    constructor(
        public readonly authService: AuthService,
    ) {
    }

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error: error.error
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'InternalServerError'
        });
    }

    public login = async (req: Request, res: Response): Promise<any> => {
        const [error, loginUserDto] = LoginUserDto.create(req.body);
        if (error) throw res.status(400).json({
            success: false,
            message: error,
            error: 'ValidationError'
        });
        this.authService.loginUser(loginUserDto!)
            .then(result => res.status(200).json({
                success: true,
                message: 'Login successfull',
                data: result
            }))
            .catch(error => this.handleError(error, res));
    }

    public register = async (req: Request, res: Response): Promise<any> => {
        const [error, registerUserDto] = RegisterUserDto.create(req.body);
        if (error) throw res.status(400).json({ error })

        this.authService.registerUser(registerUserDto!)
            .then(result => res.json({
                success: true,
                message: 'User registered succesfully',
                data: result
            }))
            .catch(error => this.handleError(error, res));
    }

    public revalidateToken = async (req: Request, res: Response): Promise<any> => {
        const user = req.body.user;
        const token = await JWTAdapter.generateToken({ user_id: user.user_id });
        if (!token) return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'InternalServerError'
        });
        res.status(200).json({
            success: true,
            message: 'Login successfully',
            data: {
                user,
                token
            }
        })
    }
}