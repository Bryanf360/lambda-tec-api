export class UpdateUnitTypeDto {

    constructor(
        public readonly name: string,
        public readonly simbol: string,
        public readonly description: string
    ) {}

    get values() {
        const unitType: {[key: string]: any} = {};
        if (this.name) unitType.name = this.name; 
        if (this.simbol) unitType.simbol = this.simbol;
        if (this.description) unitType.description = this.description;
        return unitType;
    }

    static create(props: {[key: string]: any}): [string?, UpdateUnitTypeDto?] {
        let { name, simbol, description } = props;
        // if (!name) return ['Missing name'];
        // if (!simbol) return ['Missing simbol'];
        if (description?.length === 0) description = undefined;
        return [undefined, new UpdateUnitTypeDto(name, simbol, description)];
    }
}