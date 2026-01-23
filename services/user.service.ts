import { prisma } from '../prisma/client';
import { CustomError } from '../utils';

import { RegisterUserDto } from '../dtos/create-user.dto';
import { BcryptJsAdapter, JWTAdapter } from '../config';
import { LoginUserDto, PaginationDto, UpdateUserDto } from '../dtos';

export class UserService {
    constructor() {
        // private emailService: EmailService,
    }

    public async createUser(registerUserDto: RegisterUserDto) {
        const userExists = await prisma.users.findFirst({
            where: { email: registerUserDto.email },
        });
        if (userExists) throw CustomError.badRequest('Email already exists');
        try {
            const hashedPassword = BcryptJsAdapter.hashPassword(registerUserDto.password);
            const createdUser = await prisma.users.create({
                data: {
                    ...registerUserDto,
                    password: hashedPassword,
                },
            });
            const { password, ...user } = createdUser;
            return user;
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    async getUsers(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        try {
            const [total, users] = await Promise.all([
                prisma.users.count(),
                prisma.users.findMany({
                    orderBy: {
                        created_at: 'desc',
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    select: {
                        user_id: true,
                        names: true,
                        lastnames: true,
                        email: true,
                        role: true,
                        created_at: true,
                        status: true,
                    },
                }),
            ]);
            return {
                meta: {
                    page: page,
                    limit: limit,
                    total: total,
                    prev: page != 1 ? `/api/users?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/users?page=${page + 1}&limit=${limit}`,
                },
                data: users,
            };
        } catch (error) {
            throw CustomError.internalServer('Internal server error');
        }
    }

    public async updateUserById(id: number, updateUserDto: UpdateUserDto): Promise<any> {
        try {
            const userExists = await prisma.users.findFirst({
                where: {
                    user_id: id,
                },
            });
            if (!userExists) throw CustomError.notFound(`El usuario con id ${id} no encontrado`);
            const emailExists = await prisma.users.findFirst({
                where: {
                    email: updateUserDto.email,
                },
            });
            if (emailExists && emailExists.user_id !== userExists.user_id)
                throw CustomError.notFound(`El usuario con email ${updateUserDto.email} ya existe`);
            const updatedUser = await prisma.users.update({
                where: { user_id: id },
                data: updateUserDto!.values,
            });
            return updatedUser;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw CustomError.internalServer('Error interno del servidor');
        }
    }

    public async loginUser(loginUserDto: LoginUserDto) {
        const userExists = await prisma.users.findFirst({
            where: { email: loginUserDto.email },
        });
        if (!userExists) throw CustomError.badRequest('Usuario o contraseña incorrectos');
        if (!BcryptJsAdapter.isPasswordMatch(loginUserDto.password, userExists.password)) {
            throw CustomError.badRequest('Usuario o contraseña incorrectos');
        }
        // const { password, ...user } = UserEntity.fromObject(userExists);
        const { password, created_at, ...user } = userExists;
        const token = await JWTAdapter.generateToken({ id: user.user_id });
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
