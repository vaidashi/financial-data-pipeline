import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from './../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { ValidationPipe } from '../src/common/pipes/validation.pipe';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('InstrumentsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'demo@financial-pipeline.com',
      password: 'demo123',
    });

    authToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/v1/instruments (GET)', () => {
    it('should return paginated instruments', () => {
      return request(app.getHttpServer())
        .get('/api/v1/instruments')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter by type', () => {
      return request(app.getHttpServer())
        .get('/api/v1/instruments?type=STOCK')
        .expect(200)
        .expect(res => {
          expect(res.body.data.every((item: any) => item.type === 'STOCK')).toBe(true);
        });
    });
  });

  describe('/api/v1/instruments/search (GET)', () => {
    it('should search instruments', () => {
      return request(app.getHttpServer())
        .get('/api/v1/instruments/search?q=AAPL')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/api/v1/instruments/symbol/:symbol (GET)', () => {
    it('should return instrument by symbol', () => {
      return request(app.getHttpServer())
        .get('/api/v1/instruments/symbol/AAPL')
        .expect(200)
        .expect(res => {
          expect(res.body.symbol).toBe('AAPL');
        });
    });

    it('should return 404 for non-existent symbol', () => {
      return request(app.getHttpServer()).get('/api/v1/instruments/symbol/NONEXISTENT').expect(404);
    });
  });
});
