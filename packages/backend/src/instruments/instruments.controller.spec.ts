// import { Test, TestingModule } from '@nestjs/testing';
// import { InstrumentsController } from './instruments.controller';
// import { InstrumentsService } from './instruments.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { DataInterval } from '@prisma/client';

// describe('InstrumentsController', () => {
//   let controller: InstrumentsController;
//   let service: InstrumentsService;

//   const mockInstrumentsService = {
//     findBySymbol: jest.fn(),
//     getRecentMarketData: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [InstrumentsController],
//       providers: [
//         { provide: InstrumentsService, useValue: mockInstrumentsService },
//       ],
//     })
//       .overrideGuard(JwtAuthGuard)
//       .useValue({ canActivate: () => true })
//       .overrideGuard(RolesGuard)
//       .useValue({ canActivate: () => true })
//       .compile();

//     controller = module.get<InstrumentsController>(InstrumentsController);
//     service = module.get<InstrumentsService>(InstrumentsService);
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('getRecentMarketData', () => {
//     it('should return recent market data for a symbol', async () => {
//       const symbol = 'AAPL';
//       const instrument = { id: '1', symbol, name: 'Apple Inc.' };
//       const marketData = [
//         { timestamp: new Date(), close: 150.0, interval: DataInterval.FIVE_MINUTES },
//       ];
//       mockInstrumentsService.findBySymbol.mockResolvedValue(instrument);
//       mockInstrumentsService.getRecentMarketData.mockResolvedValue(marketData);

//       const limit = 50;
//       const result = await controller.getRecentMarketData(symbol, limit);

//       expect(mockInstrumentsService.findBySymbol).toHaveBeenCalledWith(symbol);
//       expect(mockInstrumentsService.getRecentMarketData).toHaveBeenCalledWith(instrument.id, limit);
//       expect(result).toEqual(marketData);
//     });

//     it('should return an empty array if the instrument is not found', async () => {
//       const symbol = 'UNKNOWN';
//       mockInstrumentsService.findBySymbol.mockResolvedValue(null);

//       const result = await controller.getRecentMarketData(symbol, 100);

//       expect(result).toEqual([]);
//       expect(mockInstrumentsService.getRecentMarketData).not.toHaveBeenCalled();
//     });
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DataInterval } from '@prisma/client';

describe('InstrumentsController', () => {
  let controller: InstrumentsController;
  let service: InstrumentsService;

  const mockInstrumentsService = {
    findBySymbol: jest.fn(),
    getMarketData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstrumentsController],
      providers: [
        { provide: InstrumentsService, useValue: mockInstrumentsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InstrumentsController>(InstrumentsController);
    service = module.get<InstrumentsService>(InstrumentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMarketDataBySymbol', () => {
    it('should return market data for a given symbol and range', async () => {
      const symbol = 'AAPL';
      const range = '1D';
      const limit = 100;
      const instrument = { id: '1', symbol, name: 'Apple Inc.' };
      const marketData = [
        { timestamp: new Date(), close: 150.0, interval: DataInterval.FIVE_MINUTES },
      ];
      mockInstrumentsService.findBySymbol.mockResolvedValue(instrument);
      mockInstrumentsService.getMarketData.mockResolvedValue(marketData);

      const result = await controller.getMarketDataBySymbol(symbol, range, limit);

      expect(mockInstrumentsService.findBySymbol).toHaveBeenCalledWith(symbol);
      expect(mockInstrumentsService.getMarketData).toHaveBeenCalledWith(
        instrument.id,
        DataInterval.FIVE_MINUTES,
        expect.any(Date),
        undefined,
        limit,
      );
      expect(result).toEqual(marketData);
    });

    it('should return an empty array if the instrument is not found', async () => {
      const symbol = 'UNKNOWN';
      mockInstrumentsService.findBySymbol.mockResolvedValue(null);

      const result = await controller.getMarketDataBySymbol(symbol, '1D', 100);

      expect(result).toEqual([]);
      expect(mockInstrumentsService.getMarketData).not.toHaveBeenCalled();
    });
  });
});

