export class UpdatePartNumberDto {
    constructor(
        public readonly modelId: string,
        public readonly name: string,
        public readonly description?: string
    ) {}

    static create(props: { [key: string]: any }): [string?, UpdatePartNumberDto?] {
        let { modelId, name, description } = props;
        if (modelId) {
            if (isNaN(modelId) || modelId <= 0) return ['Model id is not valid'];
        }
        if (!name) return ['Missing name'];
        if (description?.length === 0) description = undefined;
        return [undefined, new UpdatePartNumberDto(modelId, name, description)];
    }
}
