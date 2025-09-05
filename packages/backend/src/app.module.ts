import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { UsersModule } from './users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FinancialDataProviderModule } from './financial-data-provider/financial-data-provider.module';
import { DataIngestionModule } from './data-ingestion/data-ingestion.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    DatabaseModule,
    CacheModule,
    AuthModule,
    UsersModule,
    InstrumentsModule,
    EventsModule,
    FinancialDataProviderModule,
    DataIngestionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
