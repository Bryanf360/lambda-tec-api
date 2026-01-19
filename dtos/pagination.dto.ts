export class PaginationDto {
    constructor(
        public readonly page: number,
        public readonly limit: number,
        public readonly dateFrom?: string,
        public readonly dateTo?: string
    ) {}

    static create(
        page: number,
        limit: number,
        dateFrom?: string,
        dateTo?: string
    ): [error?: string, PaginationDto?] {
        if (isNaN(page) || isNaN(limit)) return ['The page and limit must be numbers'];
        if (page <= 0 || limit <= 0) return ['The page and limit must be greather than cero'];
        return [undefined, new PaginationDto(page, limit, dateFrom, dateTo)];
    }
}
