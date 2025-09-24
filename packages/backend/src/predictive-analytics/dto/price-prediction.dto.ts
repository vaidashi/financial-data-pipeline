import { IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PricePredictionDto {
  @ApiProperty({
    description: 'Array of historical price data',
    example: [100, 101, 102, 103, 104],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  data!: number[];
}
