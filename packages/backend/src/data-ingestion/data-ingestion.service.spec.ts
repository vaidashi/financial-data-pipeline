import { Test, TestingModule } from '@nestjs/testing';
import { DataIngestionService } from './data-ingestion.service';
import { AlphaVantageService } from '../financial-data-provider/alpha-vantage.service';
import { InstrumentsService } from '../instruments/instruments.service';
import { DatabaseService } from '../database/database.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('DataIngestionService', () => {
  let service: DataIngestionService;
  let alphaVantageService: AlphaVantageService;
  let instrumentsService: InstrumentsService;
  let databaseService: DatabaseService;
  let cacheManager: any;

  const mockAlphaVantageService = {
    getDailyTimeSeries: jest.fn(),
  };

  const mockInstrumentsService = {
    findBySymbol: jest.fn(),
    findAll: jest.fn(),
  };

  const mockDatabaseService = {
    marketData: {
      upsert: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataIngestionService,
        { provide: AlphaVantageService, useValue: mockAlphaVantageService },
        { provide: InstrumentsService, useValue: mockInstrumentsService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<DataIngestionService>(DataIngestionService);
    alphaVantageService = module.get<AlphaVantageService>(AlphaVantageService);
    instrumentsService = module.get<InstrumentsService>(InstrumentsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ingestDailyDataForSymbol', () => {
    it('should ingest data for a symbol', async () => {
      mockInstrumentsService.findBySymbol.mockResolvedValue({ id: '1', symbol: 'TEST' });
      mockAlphaVantageService.getDailyTimeSeries.mockResolvedValue([
        {
          timestamp: new Date(),
          open: '100',
          high: '110',
          low: '90',
          close: '105',
          adjustedClose: '105',
          volume: '1000000',
          dividendAmount: '0',
          splitCoefficient: '1',
        },
      ]);
      mockDatabaseService.marketData.upsert.mockResolvedValue({});

      await service.ingestDailyDataForSymbol('TEST');

      expect(mockInstrumentsService.findBySymbol).toHaveBeenCalledWith('TEST');
      expect(mockAlphaVantageService.getDailyTimeSeries).toHaveBeenCalledWith('TEST');
      expect(mockDatabaseService.marketData.upsert).toHaveBeenCalled();
    });
  });
});
