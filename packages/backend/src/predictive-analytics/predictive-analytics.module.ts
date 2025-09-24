import { Module } from '@nestjs/common';
import { HuggingFaceService } from './hugging-face/hugging-face.service';
import { SentimentAnalysisService } from './sentiment-analysis/sentiment-analysis.service';
import { PricePredictionService } from './price-prediction/price-prediction.service';
import { PredictiveAnalyticsController } from './predictive-analytics.controller';

@Module({
  providers: [HuggingFaceService, SentimentAnalysisService, PricePredictionService],
  controllers: [PredictiveAnalyticsController],
})
export class PredictiveAnalyticsModule {}
