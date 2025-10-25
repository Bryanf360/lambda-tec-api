export class CreateReasonDto {

    constructor(
        public readonly type: 'input' | 'output',
        public readonly name: string,
        public readonly description?: string
    ) {}

    static create(props: {[key: string]: any}): [string?, CreateReasonDto?] {
        let { type, name, description } = props;
        if (!type) return ['Missing type'];
        if (!['input', 'output'].includes(type)) return ['Type is not valid'];
        if (!name) return ['Missing name'];
        if (description?.lenght === 0) description = undefined;
        return [undefined, new CreateReasonDto(type, name, description)];
    }
}