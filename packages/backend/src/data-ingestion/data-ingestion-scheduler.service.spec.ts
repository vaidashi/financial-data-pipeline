import { Test, TestingModule } from '@nestjs/testing';
import { DataIngestionSchedulerService } from './data-ingestion-scheduler.service';
import { DataIngestionService } from './data-ingestion.service';

describe('DataIngestionSchedulerService', () => {
  let service: DataIngestionSchedulerService;
  let dataIngestionService: DataIngestionService;

  const mockDataIngestionService = {
    ingestAllDailyData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataIngestionSchedulerService,
        { provide: DataIngestionService, useValue: mockDataIngestionService },
      ],
    }).compile();

    service = module.get<DataIngestionSchedulerService>(DataIngestionSchedulerService);
    dataIngestionService = module.get<DataIngestionService>(DataIngestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleDailyDataIngestion', () => {
    it('should call ingestAllDailyData', async () => {
      await service.handleDailyDataIngestion();
      expect(dataIngestionService.ingestAllDailyData).toHaveBeenCalled();
    });
  });
});
