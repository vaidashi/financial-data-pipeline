import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth(): Promise<{ 
    status: string; 
    timestamp: string;
    database: { status: string; timestamp: Date };
    version: string;
   }> {
    const dbHealth = await this.databaseService.healthCheck();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      version: '1.0.0',
    };
  }

  @Get('health/database')
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