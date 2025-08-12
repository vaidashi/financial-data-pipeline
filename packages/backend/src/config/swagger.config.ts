import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle('Financial Data Pipeline API')
        .setDescription(
            'RESTful API for real-time financial data monitoring with predictive analytics',
        )
        .setVersion('1.0.0')
        .addTag('Authentication', 'User authentication and authorization')
        .addTag('Users', 'User management operations')
        .addTag('Financial Instruments', 'Financial instruments and market data')
        .addTag('Portfolios', 'Portfolio management')
        .addTag('Watchlists', 'Watchlist management')
        .addTag('Analytics', 'Predictive analytics and ML models')
        .addBearerAuth()
        .addServer('http://localhost:3001', 'Development')
        .addServer('https://api.financial-pipeline.com', 'Production')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
        customSiteTitle: 'Financial Pipeline API Docs',
        customfavIcon: '/favicon.ico',
        customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
    });
}

