import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataIngestionService } from './data-ingestion.service';

@Injectable()
export class DataIngestionSchedulerService {
    private readonly logger: Logger = new Logger(DataIngestionSchedulerService.name);

    constructor(private readonly dataIngestionService: DataIngestionService) {}
    // Adjust for local dev sim data
    @Cron(CronExpression.EVERY_HOUR)
    async handleDailyDataIngestion() {
        this.logger.log('Running daily data ingestion job');
        this.dataIngestionService.ingestAllDailyData();
        this.logger.log('Daily data ingestion job completed');
    }
}