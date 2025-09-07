import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { setupSwagger } from './config/swagger.config';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS configuration for both HTTP and WebSockets
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost', // Docker container hostnames
      'http://frontend', // Docker service name
      'http://127.0.0.1:3000', // Alternative localhost
      'http://127.0.0.1:5000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global pipes
  app.useGlobalPipes(new ValidationPipe());

  // Setup Swagger documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    setupSwagger(app);
  }

  // Add BigInt serialization support
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);

  logger.log(`🚀 Backend server running on http://localhost:${port}`);
  logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
}

void bootstrap();
