import { Module } from '@nestjs/common';
import { DataIngestionSchedulerService } from './data-ingestion-scheduler.service';
import { DataIngestionService } from './data-ingestion.service';
import { RealTimeDataSimulatorService } from './real-time-data-simulator.service';
import { FinancialDataProviderModule } from '../financial-data-provider/financial-data-provider.module';
import { InstrumentsModule } from '../instruments/instruments.module';
import { DatabaseModule } from '../database/database.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [FinancialDataProviderModule, InstrumentsModule, DatabaseModule, EventsModule],
  providers: [DataIngestionService, DataIngestionSchedulerService, RealTimeDataSimulatorService],
  exports: [DataIngestionService],
})
export class DataIngestionModule {}
