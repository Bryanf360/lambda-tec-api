export class UpdateUserDto {
    private constructor(
        public readonly names: string,
        public readonly lastnames: string,
        public readonly email: string,
        public readonly role: 'admin' | 'technician',
        public readonly password: string,
        public readonly status: 'active' | 'inactive',
    ) {}

    get values() {
        const user: {[key: string]: any} = {};
        if (this.names) user.names = this.names;
        if (this.lastnames) user.lastnames = this.lastnames;
        if (this.email) user.email = this.email;
        if (this.role) user.role = this.role;
        if (this.password) user.password = this.password;
        if (this.status) user.status = this.status;
        return user;
    }

    static create(props: {[key: string]: any}): [string?, UpdateUserDto?] {
        const { id, names, lastnames, email, role, password, status } = props;
        if (isNaN(+id)) return ['Number ID no valid!'];

        return [undefined, new UpdateUserDto(
            names,
            lastnames,
            email,
            role,
            password,
            status
        )]
    }

}