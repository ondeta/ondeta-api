import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateCompanyAddressDto {
  @ApiProperty({ description: 'Country of the company' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'State of the company' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'City of the company' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Neighborhood of the company' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({ description: 'Street of the company' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ description: 'Number of the company' })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({ description: 'Complement of the company' })
  @IsOptional()
  @IsString()
  zip_code?: string;

  @ApiProperty({ description: 'Latitude of the company' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Longitude of the company' })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
