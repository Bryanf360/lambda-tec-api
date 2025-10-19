export class CreateModelDto {

    constructor(
        public readonly brandId: number,
        public readonly name: string,
        public readonly description?: string
    ) {}

    static create(props: {[key: string]: any} = {}): [string?, CreateModelDto?] {
        let { brandId, name, description } = props;
        if (!brandId) return ['Missing brand id'];
        if (isNaN(brandId) || Number(brandId) <= 0) return ['Brand id is not valid'];
        if (!name) return ['Missing name'];
        if (description?.length === 0) description = undefined;
        return [undefined, new CreateModelDto(+brandId, name, description)];
    }
}