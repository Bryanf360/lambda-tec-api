export class UpdatePartNumberDto {

    constructor(
        public readonly name: string,
        public readonly description?: string
    ) {}

    static create(props: {[key: string]: any}): [string?, UpdatePartNumberDto?] {
        let { name, description } = props;
        if (!name) return ['Missing name'];
        if (description?.length === 0) description = undefined;
        return [undefined, new UpdatePartNumberDto(name, description)];
    }
}