export class CreatePartNumberDto {
    constructor(public modelId: number, public name: string, public description?: string) {}

    static create(props: { [key: string]: any }): [string?, CreatePartNumberDto?] {
        let { modelId, name, description } = props;
        if (!modelId) return ['Missing model id'];
        if (isNaN(modelId) || modelId <= 0) return ['Model id is not valid'];
        if (!name) return ['Missing name'];
        if (description?.length === 0) description = undefined;
        return [undefined, new CreatePartNumberDto(+modelId, name, description)];
    }
}
