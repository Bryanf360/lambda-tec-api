export class CreateBrandDto {

    private constructor(
        public readonly name: string,
        public readonly description?: string,
    ) {}

    static create(object: {[key: string]: any}): [string?, CreateBrandDto?] {
        let { name, description } = object;
        if (!name) return ['Missing name'];
        if (description?.length === 0) description = undefined;
        return [undefined, new CreateBrandDto(name, description)]
    }
}