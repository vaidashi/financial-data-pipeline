import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { HuggingFaceService } from '../hugging-face/hugging-face.service';

@Injectable()
export class PricePredictionService {
  private readonly logger: Logger = new Logger(PricePredictionService.name);
  constructor(
    private readonly huggingFaceService: HuggingFaceService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async predict(data: number[]) {
    const cacheKey = `price:${this.getHash(JSON.stringify(data))}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      this.logger.log('Returning cached price prediction result');
      return cachedResult;
    }
    this.logger.log('Fetching new price prediction result from Hugging Face');
    const result = await this.huggingFaceService.pricePrediction(data);

    this.logger.log('Caching new price prediction result');
    await this.cacheManager.set(cacheKey, result);
    return result;
  }

  private getHash(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }
}
