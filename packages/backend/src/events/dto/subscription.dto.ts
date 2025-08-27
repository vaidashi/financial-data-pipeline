import { IsString } from 'class-validator';

export class SubscriptionDto {
  @IsString()
  room!: string;
}
