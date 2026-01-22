import { regularExps } from '../config';

export class RegisterUserDto {
    private constructor(
        public readonly names: string,
        public readonly lastnames: string,
        public readonly email: string,
        public readonly role: 'admin' | 'technician',
        public readonly password: string,
        public readonly status: 'active' | 'inactive'
    ) {}

    static create(props: { [key: string]: any }): [string?, RegisterUserDto?] {
        const { names, lastnames, email, role, password, status } = props;
        if (!names) return ['Missing names'];
        if (!lastnames) return ['Missing lastnames'];
        if (!email) return ['Missing email'];
        if (!regularExps.email.test(email)) return ['Email is not valid'];
        if (!role) return ['Missing role'];
        if (!['admin', 'technician'].includes(role)) return [`El rol ${role} no existe`];
        if (!password) return ['Missing password'];
        if (password.lenght < 6) return ['Password too short'];
        if (!status) return ['Missing status'];
        return [undefined, new RegisterUserDto(names, lastnames, email, role, password, status)];
    }
}
