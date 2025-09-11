import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InstrumentsService } from '../instruments/instruments.service';
import { EventsGateway } from '../events/events.gateway';
import { DatabaseService } from '../database/database.service';
import { Prisma, DataInterval } from '@prisma/client';

@Injectable()
export class RealTimeDataSimulatorService {
  private readonly logger = new Logger(RealTimeDataSimulatorService.name);

  constructor(
    private readonly instrumentsService: InstrumentsService,
    private readonly eventsGateway: EventsGateway,
    private readonly databaseService: DatabaseService
  ) {}

  @Interval(10000) // Simulate data every 10 seconds
  async handleInterval() {
    this.logger.log('Running real-time data simulation task');
    const instruments = await this.instrumentsService.findAll({
      where: { isActive: true },
      include: { realTimeQuote: true },
    });

    for (const instrument of instruments) {
      const lastPrice = instrument.realTimeQuote?.price ?? new Prisma.Decimal(100);
      const newPrice = this.generateNewPrice(lastPrice);
      const timestamp = new Date();

      const payload = {
        instrumentId: instrument.id,
        symbol: instrument.symbol,
        price: newPrice,
        timestamp: new Date(),
      };

      const room = `instrument-price:${instrument.symbol}`;
      const event = 'price:update';

      this.eventsGateway.broadcast(room, event, payload);
      this.logger.log(`Broadcasted new price for ${instrument.symbol}: $${newPrice}`);

      await this.databaseService.marketData.create({
        data: {
          instrumentId: instrument.id,
          timestamp,
          open: newPrice,
          high: newPrice,
          low: newPrice,
          close: newPrice,
          volume: Math.floor(Math.random() * 1000) + 100, // todo: Mock volume for now, but make it realistic later?
          interval: DataInterval.FIVE_MINUTES,
          source: 'SIMULATOR',
        },
      });
    }
  }

  private generateNewPrice(lastPrice: Prisma.Decimal): Prisma.Decimal {
    const changePercent = (Math.random() - 0.5) * 0.02; // Random change between -1% and +1%
    const newPrice = lastPrice.mul(1 + changePercent);
    return new Prisma.Decimal(newPrice.toFixed(2));
  }
}
