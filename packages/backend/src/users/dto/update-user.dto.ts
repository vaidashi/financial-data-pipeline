import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsEmail, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'First name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: 'Email verified status', required: false })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiProperty({ description: 'User preferences', required: false })
  @IsOptional()
  preferences?: any;
}
