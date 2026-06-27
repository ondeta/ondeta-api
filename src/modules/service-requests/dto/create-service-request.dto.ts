import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Length,
  IsDateString,
} from 'class-validator';

export class CreateServiceRequestDto {
  @ApiProperty({ description: 'Company service ID for the request' })
  @IsNotEmpty()
  @IsInt()
  company_service_id!: number;

  @ApiProperty({ description: 'Additional notes for the request', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Preferred date for the service',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  requested_date?: string;

  @ApiProperty({ description: 'Country' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 80)
  country!: string;

  @ApiProperty({ description: 'State' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 80)
  state!: string;

  @ApiProperty({ description: 'City' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 80)
  city!: string;

  @ApiProperty({ description: 'Neighborhood' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  neighborhood!: string;

  @ApiProperty({ description: 'Street' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 150)
  street!: string;

  @ApiProperty({ description: 'Street number' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  number!: string;

  @ApiProperty({ description: 'ZIP code' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 10)
  zip_code!: string;

  @ApiProperty({ description: 'Latitude' })
  @IsNotEmpty()
  @IsNumber()
  latitude!: number;

  @ApiProperty({ description: 'Longitude' })
  @IsNotEmpty()
  @IsNumber()
  longitude!: number;
}
