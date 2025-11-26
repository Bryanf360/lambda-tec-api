import jwt from 'jsonwebtoken';
import { envs } from './envs';

const JWT_SEED = envs.JWT_SEED;

export class JWTAdapter {

    static async generateToken(payload: any) {
        return new Promise(resolve => {
            jwt.sign(payload, JWT_SEED, { expiresIn: '1h' }, (error, token) => {
                if (error) return resolve(null);
                resolve(token)
            })
        })
    }

    static async verifyToken<T>(token: string): Promise<T | null> {
        return new Promise(resolve => {
            jwt.verify(token, JWT_SEED, (error, decoded) => {
                if (error) return resolve(null);
                resolve(decoded as T);
            });
        })
    }
}