export class CreateInputDto {
    private constructor(
        public readonly type: 'input' | 'output',
        public readonly providerId: number,
        public readonly date: Date,
        public readonly reasonId: number,
        public readonly details: {
            productId: number;
            quantity: number;
            warehouseId: number;
            instances?: { serialNumber?: string; assetNumber?: string; status: 'new' | 'used' }[];
        }[],
        public readonly code?: string,
        public readonly groupCode?: string
    ) {}

    static create(object: { [key: string]: any }): [string?, CreateInputDto?] {
        let { type, providerId, date, reasonId, code, groupCode, details } = object;
        if (!type) return ['Missing type'];
        if (!providerId) return ['Missing provider id'];
        if (isNaN(providerId)) return ['Provider id is not valid'];
        if (!date) return ['Missing date'];
        const num = Number(date);
        if (Number.isFinite(num)) return ['Date must not a number'];
        const createdDate = new Date(date);
        if (isNaN(createdDate.getTime())) {
            return ['Date is not valid'];
        }
        if (createdDate > new Date()) {
            return ['Future date is not valid'];
        }
        if (!reasonId) return ['Missing reason id'];
        if (isNaN(reasonId)) return ['Reason id is not valid'];
        // if (!groupCode) return ['Missing group code'];
        if (!details) return ['Missing details'];
        if (!Array.isArray(details)) return ['Field details is not valid'];
        if (details.length === 0) return ['Movement must have at least a one detail'];
        for (const detail of details) {
            if (
                typeof detail !== 'object' ||
                !detail.productId ||
                !detail.warehouseId ||
                !detail.quantity ||
                detail.quantity === 0
            )
                return ['Details no valids'];
            if (detail.instances) {
                for (const instance of detail.instances) {
                    if (!instance.status || !['new', 'used'].includes(instance.status))
                        return ['Product instance status is not valid'];
                }
            }
        }
        return [
            undefined,
            new CreateInputDto(type, providerId, date, reasonId, details, code, groupCode),
        ];
    }
}
