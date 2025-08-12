import { ValidationPipe as NestValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationPipe extends NestValidationPipe {
    constructor() {
        super({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            exceptionFactory: (errors: ValidationError[]) => {
                const messages = errors.map((error) => {
                    const constraints = error.constraints;

                    return {
                        property: error.property,
                        value: error.value,
                        constraints: constraints ? Object.values(constraints) : [],
                    };
                });

                return new BadRequestException({
                    message: 'Validation failed',
                    errors: messages,
                });
            },
        });
    }
}