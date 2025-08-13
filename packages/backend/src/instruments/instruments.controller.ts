import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InstrumentType, UserRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import { InstrumentsService } from './instruments.service';

@ApiTags('Financial Instruments')
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all financial instruments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: InstrumentType })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of financial instruments' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: InstrumentType,
    @Query('search') search?: string
  ) {
    if (search) {
      const instruments = await this.instrumentsService.search(search, type, limit);
      return {
        data: instruments,
        pagination: {
          page: 1,
          limit,
          total: instruments.length,
          pages: 1,
        },
      };
    }

    const skip = (page - 1) * limit;
    const where = type ? { type, isActive: true } : { isActive: true };

    const [instruments, total] = await Promise.all([
      this.instrumentsService.findAll({
        skip,
        take: limit,
        where,
        orderBy: { symbol: 'asc' },
        include: { realTimeQuote: true },
      }),
      this.instrumentsService.count(where),
    ]);

    return {
      data: instruments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search financial instruments' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, enum: InstrumentType })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(
    @Query('q') query: string,
    @Query('type') type?: InstrumentType,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number
  ) {
    return this.instrumentsService.search(query, type, limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new financial instrument (Admin only)' })
  @ApiResponse({ status: 201, description: 'Instrument created successfully' })
  async create(@Body() createInstrumentDto: CreateInstrumentDto) {
    return this.instrumentsService.create(createInstrumentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get financial instrument by ID' })
  @ApiResponse({ status: 200, description: 'Financial instrument found' })
  @ApiResponse({ status: 404, description: 'Instrument not found' })
  async findOne(@Param('id') id: string) {
    return this.instrumentsService.findById(id);
  }

  @Get('symbol/:symbol')
  @ApiOperation({ summary: 'Get financial instrument by symbol' })
  @ApiResponse({ status: 200, description: 'Financial instrument found' })
  @ApiResponse({ status: 404, description: 'Instrument not found' })
  async findBySymbol(@Param('symbol') symbol: string) {
    return this.instrumentsService.findBySymbol(symbol);
  }

  @Get(':id/market-data')
  @ApiOperation({ summary: 'Get market data for instrument' })
  @ApiQuery({ name: 'interval', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: Date })
  @ApiQuery({ name: 'to', required: false, type: Date })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Market data retrieved' })
  async getMarketData(
    @Param('id') id: string,
    @Query('interval') interval?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return this.instrumentsService.getMarketData(id, interval, fromDate, toDate, limit);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update financial instrument (Admin only)' })
  @ApiResponse({ status: 200, description: 'Instrument updated successfully' })
  async update(@Param('id') id: string, @Body() updateInstrumentDto: UpdateInstrumentDto) {
    return this.instrumentsService.update(id, updateInstrumentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete financial instrument (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Instrument deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.instrumentsService.delete(id);
  }
}
