import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const responseBody = exception.getResponse();

            if (typeof responseBody === 'string') {
                message = responseBody;
            } else {
                message = (responseBody as any).message || exception.message;
                errors = (responseBody as any).errors;
            }
        } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle Prisma errors
            status = HttpStatus.BAD_REQUEST;

            switch (exception.code) {
                case 'P2002':
                    message = 'Unique constraint violation';
                    errors = { field: exception.meta?.target };
                    break;
                case 'P2014':
                    message = 'Invalid ID';
                    break;
                case 'P2003':
                    message = 'Foreign key constraint violation';
                    break;
                case 'P2025':
                    message = 'Record not found';
                    status = HttpStatus.NOT_FOUND;
                    break;
                default:
                    message = 'Database error';
            }
        } else if (exception instanceof Prisma.PrismaClientValidationError) {
            status = HttpStatus.BAD_REQUEST;
            message = 'Database validation error';
        }

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            ...(errors && { errors }),
        };

        // Log error for debugging
        this.logger.error(
            `${request.method} ${request.url} - ${status} - ${message}`,
            exception instanceof Error ? exception.stack : exception,
        );

        response.status(status).json(errorResponse);
    }
}