export class CreateUnitTypeDto {

    constructor(
        public readonly name: string,
        public readonly simbol: string,
        public readonly description?: string
    ) {}

    static create(props: {[key: string]: any}): [string?, CreateUnitTypeDto?] {
        let { name, simbol, description } = props;
        if (!name) return ['Missing name'];
        if (!simbol) return ['Missing simbol'];
        if (description?.length === 0) description = undefined;
        return [undefined, new CreateUnitTypeDto(name, simbol, description)];
    }
}