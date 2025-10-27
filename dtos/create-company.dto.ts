import { validateRuc } from '../config';

export class CreateCompanyDto {
    constructor(
        public readonly type: 'client' | 'supplier',
        public readonly names: string,
        public readonly lastnames: string,
        public readonly ruc: string,
        public readonly provinceId: number,
        public readonly cityId: number,
        public readonly address: string,
        public readonly landline?: string,
        public readonly mobilePhone?: string,
        public readonly description?: string
    ) {}

    static create(props: { [key: string]: any }): [string?, CreateCompanyDto?] {
        let {
            type,
            names,
            lastnames,
            ruc,
            provinceId,
            cityId,
            address,
            landline,
            mobilePhone,
            description,
        } = props;
        const isNoValidRuc = validateRuc(ruc);
        if (!type) return ['Missing type'];
        if (!['client', 'supplier'].includes(type)) return ['Type is not valid'];
        if (!names) return ['Missing names'];
        if (!lastnames) return ['Missing lastnames'];
        if (!ruc) return ['Missing ruc'];
        if (isNoValidRuc) return [isNoValidRuc];
        if (!provinceId) return ['Missing province id'];
        if (isNaN(provinceId) || provinceId <= 0) return ['Province id is not valid'];
        if (!cityId) return ['Missing city id'];
        if (isNaN(cityId) || cityId <= 0) return ['City id is not valid'];
        if (!address) return ['Missing address'];
        if (description?.length === 0) description = undefined;
        return [
            undefined,
            new CreateCompanyDto(
                type,
                names,
                lastnames,
                ruc,
                +provinceId,
                +cityId,
                address,
                landline,
                mobilePhone,
                description
            ),
        ];
    }
}
