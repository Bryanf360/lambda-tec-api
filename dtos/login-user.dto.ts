import { regularExps } from "../config";

export class LoginUserDto {
    constructor(
        public readonly email: string,
        public readonly password: string,
    ) {}

    static create(props: {[key: string]: any} = {}): [string?, LoginUserDto?] {
        const { email, password } = props;
        if (!email) return ['Missing email'];
        if (!regularExps.email.test(email)) return ['Email is not valid'];
        if (!password) return ['Missing password'];
        return [undefined, new LoginUserDto(
            email,
            password,
        )]
    }
}