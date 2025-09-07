import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { alphaVantageConfig } from './alpha-vantage.config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';
import { redisConfig } from './redis.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig, alphaVantageConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3001),

        // Database
        DATABASE_URL: Joi.string().required(),

        // JWT
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

        // Redis
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().required(),

        // Security
        BCRYPT_ROUNDS: Joi.number().default(12),

        // Alpha Vantage
        ALPHA_VANTAGE_API_KEY: Joi.string().required(),
        ALPHA_VANTAGE_BASE_URL: Joi.string().optional(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
})
export class ConfigModule {}
