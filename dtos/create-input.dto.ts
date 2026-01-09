export class CreateInputDto {
    private constructor(
        public readonly type: 'input' | 'output',
        public readonly productId: number,
        public readonly providerId: number,
        public readonly warehouseId: number,
        public readonly date: Date,
        public readonly code: string,
        public readonly reasonId: number,
        public readonly groupCode: string,
        public readonly details: { productId: number; warehouseId: number; quantity: number }[]
    ) {}

    static create(object: { [key: string]: any }): [string?, CreateInputDto?] {
        let { type, productId, providerId, warehouseId, date, code, reasonId, groupCode, details } =
            object;
        /*
        if (!name) return ['Missing name'];
        if (description?.length === 0) description = undefined;
        */
        return [
            undefined,
            new CreateInputDto(
                type,
                productId,
                providerId,
                warehouseId,
                date,
                code,
                reasonId,
                groupCode,
                details
            ),
        ];
    }
}
