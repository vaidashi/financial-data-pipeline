import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { FinancialInstrument, Prisma, InstrumentType } from '@prisma/client';

import { DatabaseService } from '../database/database.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class InstrumentsService {
  private readonly logger = new Logger(InstrumentsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsGateway: EventsGateway
  ) {}

  async create(data: Prisma.FinancialInstrumentCreateInput): Promise<FinancialInstrument> {
    try {
      const newInstrument = await this.databaseService.financialInstrument.create({
        data,
      });
      this.eventsGateway.broadcast('instruments', 'instrument:create', newInstrument);
      return newInstrument;
    } catch (error) {
      this.logger.error('Error creating instrument:', error);
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.FinancialInstrumentWhereInput;
    orderBy?: Prisma.FinancialInstrumentOrderByWithRelationInput;
    include?: Prisma.FinancialInstrumentInclude;
  }): Promise<FinancialInstrument[]> {
    const { skip, take, where, orderBy, include } = params;

    const queryParams: any = {};

    if (skip !== undefined) queryParams.skip = skip;
    if (take !== undefined) queryParams.take = take;
    if (where !== undefined) queryParams.where = where;
    if (orderBy !== undefined) queryParams.orderBy = orderBy;
    if (include !== undefined) queryParams.include = include;

    const result = await this.databaseService.financialInstrument.findMany(queryParams);
    return result;
  }

  async findById(id: string): Promise<FinancialInstrument | null> {
    return this.databaseService.financialInstrument.findUnique({
      where: { id },
      include: {
        realTimeQuote: true,
        marketData: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
    });
  }

  async findBySymbol(symbol: string): Promise<FinancialInstrument | null> {
    const instrument = await this.databaseService.financialInstrument.findUnique({
      where: { symbol: symbol.toUpperCase() },
      include: {
        realTimeQuote: true,
        marketData: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument with symbol ${symbol} not found`);
    }

    return instrument;
  }

  async update(
    id: string,
    data: Prisma.FinancialInstrumentUpdateInput
  ): Promise<FinancialInstrument> {
    const instrument = await this.findById(id);

    if (!instrument) {
      throw new NotFoundException('Financial instrument not found');
    }

    const updatedInstrument = await this.databaseService.financialInstrument.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    this.logger.log('Broadcasting instrument update via WebSocket:', updatedInstrument);
    this.eventsGateway.server.emit(`instrument:update`, updatedInstrument);

    // Also try sending to the specific instrument channel
    this.eventsGateway.server.emit(`instrument:${id}`, updatedInstrument);

    return updatedInstrument;
  }

  async delete(id: string): Promise<FinancialInstrument> {
    const instrument = await this.findById(id);

    if (!instrument) {
      throw new NotFoundException('Financial instrument not found');
    }

    return this.databaseService.financialInstrument.delete({
      where: { id },
    });
  }

  async search(query: string, type?: InstrumentType, limit = 20): Promise<FinancialInstrument[]> {
    const where: Prisma.FinancialInstrumentWhereInput = {
      AND: [
        type ? { type } : {},
        {
          OR: [
            { symbol: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        },
        { isActive: true },
      ],
    };

    return this.databaseService.financialInstrument.findMany({
      where,
      take: limit,
      orderBy: [{ symbol: 'asc' }, { name: 'asc' }],
      include: {
        realTimeQuote: true,
      },
    });
  }

  async getMarketData(
    instrumentId: string,
    interval: string = 'DAILY',
    from?: Date,
    to?: Date,
    limit = 100
  ) {
    const where: any = {
      instrumentId,
      interval,
    };

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    return this.databaseService.marketData.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async count(where?: Prisma.FinancialInstrumentWhereInput): Promise<number> {
    const countParams: any = {};

    if (where !== undefined) countParams.where = where;
    return this.databaseService.financialInstrument.count(countParams);
  }
}
