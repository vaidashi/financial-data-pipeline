import { Body, Controller, Post } from '@nestjs/common';
import { SentimentAnalysisDto } from './dto/sentiment-analysis.dto';
import { PricePredictionDto } from './dto/price-prediction.dto';
import { SentimentAnalysisService } from './sentiment-analysis/sentiment-analysis.service';
import { PricePredictionService } from './price-prediction/price-prediction.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Predictive Analytics')
@Controller('predictive-analytics')
export class PredictiveAnalyticsController {
  constructor(
    private readonly sentimentAnalysisService: SentimentAnalysisService,
    private readonly pricePredictionService: PricePredictionService
  ) {}

  @Post('sentiment')
  @ApiOperation({ summary: 'Analyze sentiment of text' })
  @ApiResponse({
    status: 201,
    description: 'Sentiment analysis completed successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: {
            type: 'string',
            enum: ['neutral', 'positive', 'negative'],
          },
          score: {
            type: 'number',
            format: 'float',
          },
        },
      },
      example: [
        {
          label: 'neutral',
          score: 0.8987345695495605,
        },
        {
          label: 'positive',
          score: 0.08995559811592102,
        },
        {
          label: 'negative',
          score: 0.011309796944260597,
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: SentimentAnalysisDto })
  sentimentAnalysis(@Body() sentimentAnalysisDto: SentimentAnalysisDto) {
    return this.sentimentAnalysisService.analyze(sentimentAnalysisDto.text);
  }

  @Post('price')
  @ApiOperation({ summary: 'Predict price based on data' })
  @ApiResponse({
    status: 201,
    description: 'Price prediction completed successfully',
    schema: {
      type: 'array',
      items: {
        type: 'number',
        format: 'float',
      },
      example: [105.31, 105.63, 107.09, 108.33, 108.61],
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: PricePredictionDto })
  pricePrediction(@Body() pricePredictionDto: PricePredictionDto) {
    return this.pricePredictionService.predict(pricePredictionDto.data);
  }
}
