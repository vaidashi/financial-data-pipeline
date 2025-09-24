import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SentimentAnalysisDto {
  @ApiProperty({
    description: 'Text to analyze for sentiment',
    example: 'I love using this financial app!',
  })
  @IsString()
  text!: string;
}
