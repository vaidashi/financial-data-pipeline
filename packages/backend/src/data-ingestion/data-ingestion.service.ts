import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
    AlphaVantageService,
    DailyData,
} from '../financial-data-provider/alpha-vantage.service';
import { InstrumentsService } from '../instruments/instruments.service';
import { DatabaseService } from '../database/database.service';
import { DataInterval, Prisma } from '@prisma/client';

@Injectable()
export class DataIngestionService {
    private readonly logger: Logger = new Logger(DataIngestionService.name);

    constructor(
        private alphaVantageService: AlphaVantageService,
        private instrumentsService: InstrumentsService,
        private databaseService: DatabaseService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async ingestDailyDataForSymbol(symbol: string): Promise<void> {
        this.logger.log(`Starting data ingestion for symbol: ${symbol}`);

        try {
            const instrument = await this.instrumentsService.findBySymbol(symbol);

            if (!instrument) {
                this.logger.warn(`Instrument with symbol ${symbol} not found. Skipping.`);
                return;
            }

            const cacheKey = `daily-data-${symbol}`;
            const cachedData = await this.cacheManager.get<DailyData[]>(cacheKey);

            if (cachedData) this.logger.log(`Using cached daily data for symbol: ${symbol}`);

            const marketData = cachedData ?? await this.alphaVantageService.getDailyTimeSeries(symbol);
            this.logger.log(`Fetched ${marketData.length} daily data points for symbol: ${symbol}`);

            if (!cachedData && marketData?.length > 0) {
                // Cache for 1 hour
                await this.cacheManager.set(cacheKey, marketData, 60 * 60 * 1000);
            }

            if (marketData?.length === 0) {
                this.logger.log(`No new daily data for symbol ${symbol}`);
                return;
            }

            const dataToSave = marketData.map(data => ({
                instrumentId: instrument.id,
                timestamp: data.timestamp,
                open: new Prisma.Decimal(data.open),
                high: new Prisma.Decimal(data.high),
                low: new Prisma.Decimal(data.low),
                close: new Prisma.Decimal(data.close),
                volume: BigInt(data.volume),
                interval: DataInterval.DAILY,
                source: 'AlphaVantage',
            }));

            for (const data of dataToSave) {
                await this.databaseService.marketData.upsert({
                    where: {
                        instrumentId_timestamp_interval: {
                            instrumentId: data.instrumentId,
                            timestamp: data.timestamp,
                            interval: DataInterval.DAILY
                        },
                    },
                    update: data,

                    create: data,
                });
            }

            this.logger.log(
                `Successfully ingested ${dataToSave.length} daily data points for symbol: ${symbol}`,
            );
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error ingesting daily data for symbol ${symbol}: ${error.stack}`);
            } else {
                this.logger.error(`Unknown error ingesting daily data for symbol ${symbol}: ${JSON.stringify(error)}`);
            }
        }
    }

    async ingestAllDailyData(): Promise<void> {
        this.logger.log('Starting daily data ingestion for all instruments...');
        const instruments = await this.instrumentsService.findAll({});
        
        for (const instrument of instruments) {
            await this.ingestDailyDataForSymbol(instrument.symbol);
        }
        this.logger.log('Finished daily data ingestion for all instruments.');
    }
}