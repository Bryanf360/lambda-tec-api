import { NextFunction, Request, Response } from "express";

import { JWTAdapter } from "../config";
import { prisma } from "../prisma/client";

export class AuthMiddlware {

    static async validateJWT(req: Request, res: Response, next: NextFunction): Promise<any> {
        const authorization = req.header('Authorization');    
        if (!authorization) return res.status(401).json({ error: 'No token provided' })
        if (!authorization.startsWith('Bearer ')) return res.status(401).json({ error: 'Invalid bearer token' })
        const token = authorization.split(" ").at(1) || "";
        try {
            const payload = await JWTAdapter.verifyToken<{ user_id: string }>(token);
            if (!payload) return res.status(401).json({ error: 'Invalid token' })
            const user = await prisma.users.findFirst({
                where: {
                    user_id: +payload.user_id
                }
            });
            if (!user) return res.status(401).json({ error: 'Invalid token - user' })
            // const userEntity = UserEntity.fromObject(user);
            const { created_at, ...data } = user;
            // delete userEntity.password;
            req.body = req.body || {};
            req.body.user = {
                ...data,
                password: undefined
            };
            next();
        } catch(error) {
            console.log('error: ', error)
            res.status(500).json({ 
                success: false,
                message: 'Internal server error',
                error: 'InternalServerError'
             })
        }
    }
}