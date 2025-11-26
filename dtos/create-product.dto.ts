export class CreateProductDto {

    constructor(
        public readonly type: 'consumable' | 'equipment',
        public readonly name: string,
        public readonly brandId: number,
        public readonly modelId: number,
        public readonly partNumberId: number,
        public readonly unitTypeId: number,
        public readonly status: 'active' | 'inactive',
        public readonly description?: string,
    ) {}

    static create(props: {[key: string]: any}): [string?, CreateProductDto?] {
        let { type, name, description, brandId, modelId, partNumberId, unitTypeId, status } = props;
        if (!type) return ['Missing type'];
        if (!['consumable', 'equipment'].includes(type)) return ['Type is no valid'];
        if (!name) return ['Missing name'];
        if (!brandId) return ['Missing brand id'];
        if (isNaN(brandId)) return ['Brand id is not valid']
        if (!modelId) return ['Missing model id'];
        if (isNaN(modelId)) return ['Model id is not valid']
        if (!partNumberId) return ['Missing part number id'];
        if (isNaN(partNumberId)) return ['Missing part number id is not valid'];
        if (!unitTypeId) return ['Missing unit type id'];
        if (isNaN(unitTypeId)) return ['Missgin unit type id is not valid']
        if (!status) return ['Missgin status'];
        if (!['active', 'inactive'].includes(status)) return ['Status is not valid'];
        if (description?.length === 0) description = undefined;
        return [undefined, new CreateProductDto(
            type,
            name,
            +brandId,
            +modelId,
            +partNumberId,
            +unitTypeId,
            status,
            description
        )];
    }
}