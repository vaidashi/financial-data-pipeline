import { InferenceClient } from '@huggingface/inference';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HuggingFaceService {
  private readonly logger = new Logger(HuggingFaceService.name);
  private readonly hfClient: InferenceClient;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('huggingface.apiKey')!;
    this.hfClient = new InferenceClient(this.apiKey);
  }

  async sentimentAnalysis(text: string): Promise<any> {
    this.logger.log('Getting sentiment analysis for input: ', text);
    const response = await this.hfClient.textClassification({
      model: 'ProsusAI/finbert',
      inputs: text,
    });
    return response;
  }

  pricePrediction(data: number[]): number[] {
    /** Generate price predictions based on recent data trends
     *
     * This is a placeholder implementation. In a real-world scenario, you would call a Hugging Face model here.
     * However, time series Inference Providers are not supported by the current Hugging Face Inference API.
     *
     * For demonstration purposes, this function calculates a simple moving average and projects future values.
     */
    this.logger.log('Getting price prediction for input data: ', data);

    if (data.length < 5) {
      throw new Error('Not enough data points to make a prediction');
    }
    const recent = data.slice(-5);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const lastValue = data[data.length - 1]!;

    let avgChange = 0;

    for (let i = 1; i < recent.length; i++) {
      avgChange += recent[i]! - recent[i - 1]!;
    }

    avgChange /= recent.length - 1;

    // Generate predictions with slight randomness
    return Array(5)
      .fill(0)
      .map((_, i) =>
        parseFloat(
          (lastValue + avgChange * (i + 1) + avg * 0.01 * (Math.random() - 0.5)).toFixed(2)
        )
      );
  }
}
