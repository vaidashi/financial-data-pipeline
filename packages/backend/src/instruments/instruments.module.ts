import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { EventsModule } from '../events/events.module';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [InstrumentsController],
  providers: [InstrumentsService],
  exports: [InstrumentsService],
})
export class InstrumentsModule {}
