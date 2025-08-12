import { ApiProperty } from '@nestjs/swagger';
import { InstrumentType } from '@prisma/client';
import {
    IsNotEmpty,
    IsString,
    IsEnum,
    IsOptional,
    IsBoolean,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateInstrumentDto {
    @ApiProperty({
        description: 'Trading symbol',
        example: 'AAPL',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(20)
    symbol!: string;

    @ApiProperty({
        description: 'Instrument name',
        example: 'Apple Inc.',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name!: string;

    @ApiProperty({
        description: 'Instrument description',
        example: 'Apple Inc. designs, manufactures, and markets consumer electronics...',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({
        description: 'Instrument type',
        enum: InstrumentType,
        example: InstrumentType.STOCK,
    })
    @IsEnum(InstrumentType)
    type!: InstrumentType;

    @ApiProperty({
        description: 'Exchange where the instrument is traded',
        example: 'NASDAQ',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    exchange!: string;

    @ApiProperty({
        description: 'Trading currency',
        example: 'USD',
        default: 'USD',
    })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    currency?: string = 'USD';

    @ApiProperty({
        description: 'Sector',
        example: 'Technology',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    sector?: string;

    @ApiProperty({
        description: 'Industry',
        example: 'Consumer Electronics',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    industry?: string;

    @ApiProperty({
        description: 'Market capitalization',
        required: false,
    })
    @IsOptional()
    marketCap?: bigint;

    @ApiProperty({
        description: 'Whether the instrument is active for trading',
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;

    @ApiProperty({
        description: 'Additional metadata',
        required: false,
    })
    @IsOptional()
    metadata?: any;
}