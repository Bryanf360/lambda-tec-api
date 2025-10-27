import { validateRuc } from '../config';

export class UpdateCompanyDto {
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

    static create(props: { [key: string]: any }): [string?, UpdateCompanyDto?] {
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
        if (type) {
            if (!['client', 'supplier'].includes(type)) return ['Type is not valid'];
        }
        if (ruc) {
            const isNotValidRuc = validateRuc(ruc);
            if (isNotValidRuc) return [isNotValidRuc];
        }
        if (provinceId) {
            if (isNaN(provinceId) || provinceId <= 0) return ['Province id is not valid'];
        }
        if (cityId) {
            if (isNaN(cityId) || cityId <= 0) return ['City id is not valid'];
        }
        if (description?.length === 0) description = undefined;
        return [
            undefined,
            new UpdateCompanyDto(
                type,
                names,
                lastnames,
                ruc,
                provinceId,
                cityId,
                address,
                landline,
                mobilePhone,
                description
            ),
        ];
    }
}
