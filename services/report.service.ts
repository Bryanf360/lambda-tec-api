import { PaginationDto } from '../dtos';
import { CustomError } from '../utils';

export class ReportService {
    async getInstances(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;
        try {
            return {
                data: [],
                meta: {
                    page: page,
                    limit: limit,
                    total: 0,
                    prev:
                        page != 1 ? `/api/reports/instances?page=${page - 1}&limit=${limit}` : null,
                    next: `/api/reports/instances?page=${page + 1}&limit=${limit}`,
                },
            };
        } catch (error) {
            console.error(error);
            throw CustomError.internalServer('Error interno del servidor');
        }
    }
}
