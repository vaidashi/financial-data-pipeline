import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AlphaVantageService, DailyData } from './alpha-vantage.service';
import { HttpException } from '@nestjs/common';

describe('AlphaVantageService', () => {
  let service: AlphaVantageService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'alphaVantage.apiKey') return 'test_api_key';
      if (key === 'alphaVantage.baseUrl') return 'https://test.url';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlphaVantageService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AlphaVantageService>(AlphaVantageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDailyTimeSeries', () => {
    it('should fetch and transform daily time series data', async () => {
      const mockResponse = {
        data: {
          'Time Series (Daily)': {
            '2024-01-01': {
              '1. open': '100',
              '2. high': '110',
              '3. low': '90',
              '4. close': '105',
              '5. volume': '1000000',
            },
          },
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result: DailyData[] = await service.getDailyTimeSeries('TEST');
      expect(result).toHaveLength(1);
      expect(result[0]?.open).toBe('100');
    });

    it('should handle API error messages', async () => {
      const mockResponse = {
        data: { 'Error Message': 'Invalid API call' },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      await expect(service.getDailyTimeSeries('TEST')).rejects.toThrow(HttpException);
    });

    it('should handle http errors', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Network error')));
      await expect(service.getDailyTimeSeries('TEST')).rejects.toThrow(HttpException);
    });
  });
});
