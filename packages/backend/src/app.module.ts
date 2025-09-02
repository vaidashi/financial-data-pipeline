import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, UsersModule, InstrumentsModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
