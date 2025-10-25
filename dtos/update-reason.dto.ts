export class UpdateReasonDto {

    constructor(
        public readonly type: 'input' | 'output',
        public readonly name: string,
        public readonly description?: string
    ) {}

    static create(props: {[key: string]: any}): [string?, UpdateReasonDto?] {
        let { type, name, description } = props;
        if (!type) return ['Missing type'];
        if (!['input', 'output'].includes(type)) return ['Type is not valid'];
        if (!name) return ['Missgin name'];
        if (description?.length === 0) description = undefined;
        return [undefined, new UpdateReasonDto(type, name, description)];
    }
}