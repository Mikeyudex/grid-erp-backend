export class ApiResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
    error?: string;

    constructor(statusCode: number, message: string, data?: T, error?: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.error = error;
    }

    static success<T>(message: string, data?: T, statusCode: number = 200): ApiResponse<T> {
        return new ApiResponse<T>(statusCode, message, data);
    }

    static error(message: string, error: string, statusCode: number = 400): ApiResponse<null> {
        return new ApiResponse<null>(statusCode, message, undefined, error);
    }
}
