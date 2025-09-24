import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { HuggingFaceService } from '../hugging-face/hugging-face.service';

@Injectable()
export class SentimentAnalysisService {
  constructor(
    private readonly huggingFaceService: HuggingFaceService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache
  ) {}

  async analyze(text: string) {
    const cacheKey = `sentiment:${this.getHash(text)}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.huggingFaceService.sentimentAnalysis(text);

    await this.cacheManager.set(cacheKey, result, 3600); // Cache for 1 hour

    return result;
  }

  private getHash(input: string): string {
    return crypto.createHash('md5').update(input).digest('hex');
  }
}
