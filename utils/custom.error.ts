export class CustomError extends Error {

    private constructor(
        public readonly statusCode: number,
        public readonly message: string,
        public readonly error: string,
    ) {
        super(message)    
    }

    static badRequest(message: string) {
        return new CustomError(400, message, 'ValidationError');
    }

    static unauthorized(message: string) {
        return new CustomError(401, message, 'UnauthorizedError');
    }

    static forbidden(message: string) {
        return new CustomError(403, message, 'ForbiddenError');
    }

    static notFound(message: string) {
        return new CustomError(404, message, 'NotFoundError');
    }

    static internalServer(message: string) {
        return new CustomError(500, message, 'InternalServerError');
    }
}