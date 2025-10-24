export class UpdateProductDto {

    constructor(
        public readonly type: 'consumable' | 'equipment',
        public readonly name: string,
        public readonly description: string,
        public readonly brandId: number,
        public readonly modelId: number,
        public readonly partNumberId: number,
        public readonly uniTypeId: number,
        public readonly status: 'active' | 'inactive'
    ) {}

    static create(props: {[key: string]: any}): [string?, UpdateProductDto?] {
        const { type, name, description, brandId, modelId, partNumberId, unitTypeId, status } = props;
        if (type) {
            if (!['consumable', 'equipment'].includes(type)) return ['Type is not valid'];
        }
        if (brandId) {
            if (isNaN(brandId) || brandId <= 0) return ['Brand id is not valid'];
        }
        if (modelId) {
            if (isNaN(modelId) || modelId <= 0) return ['Model id is not valid'];
        }
        if (partNumberId) {
            if (isNaN(partNumberId) || partNumberId <= 0) return ['Part number id is not valid'];
        }
        if (unitTypeId) {
            if (isNaN(unitTypeId) || unitTypeId <= 0) return ['Unit type id is not valid'];
        }
        if (status) {
            if (!['active', 'inactive'].includes(status)) return ['Status is not valid'];
        }
        return [undefined, new UpdateProductDto(type, name, description, +brandId, +modelId, +partNumberId, +unitTypeId, status)];
    }
}