export class UpdateBrandDto {

    constructor(
        public readonly name: string,
        private readonly description?: string,
    ) {}

    get values() {
        const brand: {[key: string]: any} = {};
        if (this.name) brand.name = this.name;
        if (this.description) brand.description = this.description;
        return brand; 
    }

    static create(props: {[key: string]: any} = {}): [string?, UpdateBrandDto?] {
        let { name, description } = props;
        if (!name) return ['Missing name'];
        if (description?.length === 0) description = undefined;
        return [undefined, new UpdateBrandDto(name, description)];
    }
}