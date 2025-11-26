import bcryptjs from "bcryptjs";

export class BcryptJsAdapter {

    static hashPassword(password: string): string {
        const salt = bcryptjs.genSaltSync(10);
        return bcryptjs.hashSync(password, salt);
    }

    static isPasswordMatch(password: string, hash: string): boolean {
        return bcryptjs.compareSync(password, hash);
    }
}