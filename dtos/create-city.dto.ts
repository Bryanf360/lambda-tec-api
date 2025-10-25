export class CreateCityDto {

    private constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly provinceId: number
    ) {}

    static create(props: {[key: string]: any} = {}): [string?, CreateCityDto?] {
        let { name, description, provinceId } = props;
        if (!name) return ['Missing name'];
        if (description?.length === 0) description = undefined; 
        if (!provinceId) return ['Missing provinceId'];
        if (isNaN(provinceId)) return ['provinceId is not valid'];
        return [undefined, new CreateCityDto(name, description, +provinceId)];
    }
}