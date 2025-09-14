


export class DbErrorUtils {

    static isDuplicatedKeyError(error: any): boolean {
        return error?.name === 'MongoError' && error?.code === 11000;
    }

    static isDuplicatedKeyErrorWithMessage(error: any, message: string): boolean {
        return DbErrorUtils.isDuplicatedKeyError(error) && error?.message?.includes(message);
    }

    static isMongoConnectionError(error: any): boolean {
        return (
            error?.name === 'MongoNetworkError' ||
            error?.message?.includes('ECONNREFUSED') ||
            error?.message?.includes('connection') ||
            error?.message?.includes('timeout')
        );
    }

    static isMongoValidationError(error: any): boolean {
        return error?.name === 'ValidationError' || error?.code === 11000; // 11000 = error de clave duplicada
    }

    static formatValidationError(error: any): string {
        if (error?.errors) {
            return Object.values(error.errors)
                .map((err: any) => err.message)
                .join(', ');
        }
        if (error?.code === 11000) {
            return 'Registro duplicado (clave única violada)';
        }
        return error.message;
    }
}