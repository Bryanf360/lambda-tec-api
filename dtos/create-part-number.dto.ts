export class CreatePartNumberDto {

    constructor(
        public name: string,
        public description?: string,
    ) {}

    static create(props: {[key: string]: any}): [string?, CreatePartNumberDto?] {
        let { name, description } = props;
        if (!name) return ['Missing name'];
        if (description?.length === 0) description = undefined;
        return [undefined, new CreatePartNumberDto(name, description)];
    }
}