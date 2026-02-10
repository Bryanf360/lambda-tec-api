import jwt, { JwtPayload } from 'jsonwebtoken';
import { envs } from './envs';

const JWT_SEED = envs.JWT_SEED;

export class JWTAdapter {
  static async generateToken(payload: unknown): Promise<string | null> {
    return new Promise((resolve) => {
      jwt.sign(payload as object, JWT_SEED, { expiresIn: '1h' }, (error: unknown, token?: string) => {
        if (error) return resolve(null);
        resolve(token ?? null);
      });
    });
  }

  static async verifyToken<T = JwtPayload>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, JWT_SEED, (error: unknown, decoded: unknown) => {
        if (error) return resolve(null);
        resolve(decoded as T);
      });
    });
  }
}
