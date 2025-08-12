import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { FinancialInstrument, Prisma, InstrumentType } from '@prisma/client';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class InstrumentsService {
    private readonly logger = new Logger(InstrumentsService.name);

    constructor(private readonly databaseService: DatabaseService) { }

    async create(data: Prisma.FinancialInstrumentCreateInput): Promise<FinancialInstrument> {
        try {
            return await this.databaseService.financialInstrument.create({
                data,
            });
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
        if (include !== undefined) queryParams.cursor = include;


        return this.databaseService.financialInstrument.findMany(queryParams);
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
        return this.databaseService.financialInstrument.findUnique({
            where: { symbol: symbol.toUpperCase() },
            include: {
                realTimeQuote: true,
                marketData: {
                    take: 1,
                    orderBy: { timestamp: 'desc' },
                },
            },
        });
    }

    async update(id: string, data: Prisma.FinancialInstrumentUpdateInput): Promise<FinancialInstrument> {
        const instrument = await this.findById(id);

        if (!instrument) {
            throw new NotFoundException('Financial instrument not found');
        }

        return this.databaseService.financialInstrument.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
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
            orderBy: [
                { symbol: 'asc' },
                { name: 'asc' },
            ],
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
        limit = 100,
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