import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Length,
} from 'class-validator';

export class CreateCompanyServiceDto {
  @ApiProperty({ description: 'Name of the service' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name_service!: string;

  @ApiProperty({ description: 'Service description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Base price for the service',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  base_price?: number;

  @ApiProperty({
    description: 'Estimated duration in minutes',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  estimated_duration?: number;
}
