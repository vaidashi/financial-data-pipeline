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

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global pipes
  app.useGlobalPipes(new ValidationPipe());

  // Setup Swagger documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    setupSwagger(app);
  }

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);

  logger.log(`🚀 Backend server running on http://localhost:${port}`);
  logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
}

void bootstrap();