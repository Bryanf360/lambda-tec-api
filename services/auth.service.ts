import { prisma } from "../prisma/client";
import { CustomError } from "../utils";

import { RegisterUserDto } from '../dtos/create-user.dto';
import { BcryptJsAdapter, JWTAdapter } from "../config";
import { LoginUserDto } from "../dtos";

export class AuthService {
    
    constructor(
        // private emailService: EmailService,
    ) {
    }

    public async registerUser(registerUserDto: RegisterUserDto) {
        const userExists = await prisma.users.findFirst({
            where: { email: registerUserDto.email }
        });
        if (userExists) throw CustomError.badRequest('Email already exists');
        try {
            const hashedPassword = BcryptJsAdapter.hashPassword(registerUserDto.password)
            const registeredUser = await prisma.users.create({
                data: {
                    ...registerUserDto,
                    password: hashedPassword
                }
            });
            // TODO: await this.sendConfirmationEmail(registeredUser.email);            
            // const { password, ...user } = UserEntity.fromObject(registeredUser);
            const { password, ...user } = registeredUser;
            const token = await JWTAdapter.generateToken({ user_id: user.user_id });
            if (!token) throw CustomError.internalServer('Error while creating JWT');
            return {
                user: user,
                token: token,
            };
        } catch(error) {
            throw CustomError.internalServer(`${ error }`)
        }
    }

    public async loginUser(loginUserDto: LoginUserDto) {
        const userExists = await prisma.users.findFirst({
            where: { email: loginUserDto.email }
        });
        if (!userExists) throw CustomError.badRequest('Usuario o contraseña incorrectos');
        if (!BcryptJsAdapter.isPasswordMatch(loginUserDto.password, userExists.password)) {
            throw CustomError.badRequest('Usuario o contraseña incorrectos');
        }
        // const { password, ...user } = UserEntity.fromObject(userExists);
        const { password, created_at, ...user } = userExists;
        const token = await JWTAdapter.generateToken({ user_id: user.user_id });
        if (!token) throw CustomError.internalServer('Error while creating JWT');
        return {
            user: user,
            token: token,
        };
    }

    // private async sendConfirmationEmail(email: string) {
    //     const token = await JWTAdapter.generateToken({ email });
    //     if (!token) throw CustomError.internalServer('Error generating token');
    //     const link = `${envs.BACKEND_URL}/auth/validate-email/${token}`;
    //     const html = `
    //         <h1>Validate your email</h1>
    //         <p>Click on the following link to validate your email</p>
    //         <a href="${link}">Validate your email: ${email}</a>
    //     `;
    //     const options: SendMailOptions = {
    //         to: email,
    //         subject: 'Validate your email',
    //         htmlBody: html,
    //     };
    //     const isSentEmail = await this.emailService.sendEmail(options);
    //     if (!isSentEmail) throw CustomError.internalServer('Error sending email')
    //     return true;
    // }    
}