import { registerAs } from '@nestjs/config';

export const alphaVantageConfig = registerAs('alphaVantage', () => ({
  apiKey: process.env.ALPHA_VANTAGE_API_KEY,
  baseUrl: process.env.ALPHA_VANTAGE_BASE_URL || 'https://www.alphavantage.co',
}));
