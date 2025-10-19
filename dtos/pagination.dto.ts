export class PaginationDto {
    constructor(
        public readonly page: number,
        public readonly limit: number
    ) {}

    static create(page: number, limit: number): [error?: string, PaginationDto?] {
        if (isNaN(page) || isNaN(limit)) return ['The page and limit must be numbers'];
        if (page <= 0 || limit <= 0) return ['The page and limit must be greather than cero'];
        return [undefined, new PaginationDto(page, limit)];
    }
}