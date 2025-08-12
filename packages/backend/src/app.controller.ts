import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({ status: 200, description: 'API information' })
  getApiInfo() {
    return {
      name: 'Financial Data Pipeline API',
      version: '1.0.0',
      description: 'Real-time financial data monitoring with predictive analytics',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        documentation: '/api/docs',
        health: '/api/v1/health',
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        instruments: '/api/v1/instruments',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'System health status',
    schema: {
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        uptime: { type: 'number' },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
        version: { type: 'string' },
        environment: { type: 'string' },
      },
    },
  })
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    database: { status: string; timestamp: Date };
    version: string;
    environment: string;
  }> {
    const dbHealth = await this.databaseService.healthCheck();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealth,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('health/database')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database health information' })
  async getDatabaseHealth(): Promise<{
    health: { status: string; timestamp: Date };
    info: {
      version: string;
      activeConnections: number;
      databaseSize: string;
    };
  }> {
    const [health, info] = await Promise.all([
      this.databaseService.healthCheck(),
      this.databaseService.getConnectionInfo(),
    ]);

    return { health, info };
  }
}