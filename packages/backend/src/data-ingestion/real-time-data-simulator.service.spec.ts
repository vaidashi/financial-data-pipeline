import { Test, TestingModule } from '@nestjs/testing';
import { RealTimeDataSimulatorService } from './real-time-data-simulator.service';
import { InstrumentsService } from '../instruments/instruments.service';
import { EventsGateway } from '../events/events.gateway';
import { DatabaseService } from '../database/database.service';
import { ScheduleModule } from '@nestjs/schedule';
import { Prisma, InstrumentType } from '@prisma/client';

describe('RealTimeDataSimulatorService', () => {
  let service: RealTimeDataSimulatorService;
  let instrumentsService: InstrumentsService;
  let eventsGateway: EventsGateway;
  let databaseService: DatabaseService;

  const mockInstrumentsService = {
    findAll: jest.fn(),
  };

  const mockEventsGateway = {
    broadcast: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot()],
      providers: [
        RealTimeDataSimulatorService,
        { provide: InstrumentsService, useValue: mockInstrumentsService },
        { provide: EventsGateway, useValue: mockEventsGateway },
        { provide: DatabaseService, useValue: { marketData: { create: jest.fn() } } },
      ],
    }).compile();

    service = module.get<RealTimeDataSimulatorService>(RealTimeDataSimulatorService);
    instrumentsService = module.get<InstrumentsService>(InstrumentsService);
    eventsGateway = module.get<EventsGateway>(EventsGateway);
    databaseService = module.get<DatabaseService>(DatabaseService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch instruments and broadcast price updates', async () => {
    const instruments = [
      {
        id: '1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: InstrumentType.STOCK,
        exchange: 'NASDAQ',
        currency: 'USD',
        isActive: true,
        realTimeQuote: { price: new Prisma.Decimal(150) },
      },
      {
        id: '2',
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        type: InstrumentType.STOCK,
        exchange: 'NASDAQ',
        currency: 'USD',
        isActive: true,
        realTimeQuote: { price: new Prisma.Decimal(2800) },
      },
    ];
    jest.spyOn(instrumentsService, 'findAll').mockResolvedValue(instruments as any);

    await service.handleInterval();

    expect(instrumentsService.findAll).toHaveBeenCalled();
    expect(databaseService.marketData.create).toHaveBeenCalledTimes(2);
    expect(eventsGateway.broadcast).toHaveBeenCalledTimes(2);
    expect(eventsGateway.broadcast).toHaveBeenCalledWith(
      'instrument-price:AAPL',
      'price:update',
      expect.any(Object)
    );
    expect(eventsGateway.broadcast).toHaveBeenCalledWith(
      'instrument-price:GOOGL',
      'price:update',
      expect.any(Object)
    );
  });
});
