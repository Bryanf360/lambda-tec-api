export class UpdateUserPasswordDto {
    private constructor(public readonly password: string) {}

    static create(props: { [key: string]: any }): [string?, UpdateUserPasswordDto?] {
        const { password } = props;
        return [undefined, new UpdateUserPasswordDto(password)];
    }
}
