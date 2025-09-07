import { Module } from '@nestjs/common';
import { DataIngestionSchedulerService } from './data-ingestion-scheduler.service';
import { DataIngestionService } from './data-ingestion.service';
import { FinancialDataProviderModule } from '../financial-data-provider/financial-data-provider.module';
import { InstrumentsModule } from '../instruments/instruments.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [FinancialDataProviderModule, InstrumentsModule, DatabaseModule],
  providers: [DataIngestionService, DataIngestionSchedulerService],
  exports: [DataIngestionService],
})
export class DataIngestionModule {}
