import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

type AlphaVantageDailyData = {
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
  'Error Message'?: string;
};
// Only daily info available with free api key
export type DailyData = {
  timestamp: Date;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

@Injectable()
export class AlphaVantageService {
  private readonly logger = new Logger(AlphaVantageService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private lastRequestTimestamp = 0;
  private readonly rateLimit = 12000; // 12 seconds between requests

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.apiKey = this.configService.get<string>('alphaVantage.apiKey')!;
    this.baseUrl = this.configService.get<string>('alphaVantage.baseUrl')!;
  }

  async getDailyTimeSeries(symbol: string): Promise<DailyData[]> {
    await this.wait();
    const url = `${this.baseUrl}/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get<AlphaVantageDailyData>(url));
      const data = response.data;

      if (data['Error Message']) {
        throw new HttpException(data['Error Message'], HttpStatus.BAD_REQUEST);
      }

      return this.transformDailyTimeSeries(data);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to fetch daily time series for ${symbol}`, error.stack);
      } else {
        this.logger.error(`Failed to fetch daily time series for ${symbol}`, error);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch data from Alpha Vantage',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTimestamp;

    if (timeSinceLastRequest < this.rateLimit) {
      const waitTime = this.rateLimit - timeSinceLastRequest;
      this.logger.log(`Rate limit exceeded. Waiting for ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTimestamp = Date.now();
  }

  private transformDailyTimeSeries(data: AlphaVantageDailyData): DailyData[] {
    const timeSeries = data['Time Series (Daily)'];

    if (!timeSeries) {
      return [];
    }

    return Object.entries(timeSeries).map(([date, values]) => ({
      timestamp: new Date(date),
      open: values['1. open'],
      high: values['2. high'],
      low: values['3. low'],
      close: values['4. close'],
      volume: values['5. volume'],
    }));
  }
}
