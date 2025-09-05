import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AlphaVantageService } from './alpha-vantage.service';

@Module({
  imports: [HttpModule],
  providers: [AlphaVantageService],
  exports: [AlphaVantageService],
})
export class FinancialDataProviderModule {}
