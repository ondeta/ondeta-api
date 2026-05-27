import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';

export class ConvertToCompanyDto {
  @ApiProperty({ description: 'Company name' })
  @IsNotEmpty({ message: 'Company name is required' })
  @IsString()
  name_company!: string;

  @ApiProperty({
    description: 'CNPJ number of the company',
    example: '12345678900123',
  })
  @IsNotEmpty({ message: 'CNPJ is required' })
  @Length(14, 14, { message: 'CNPJ must be 14 digits' })
  @IsString()
  cnpj!: string;

  @ApiProperty({
    description: 'Phone number of the company',
    example: '5511912345678',
  })
  @IsOptional()
  @Length(10, 15, {
    message: 'Phone number must be between 10 and 15 characters',
  })
  @IsString()
  phone_number?: string;

  @ApiProperty({
    description: 'Company description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Country where the company is located',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'State where the company is located',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: 'City where the company is located',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Neighborhood where the company is located',
    required: false,
  })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({
    description: 'Street where the company is located',
    required: false,
  })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({
    description: 'Street number',
    required: false,
  })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({
    description: 'ZIP code',
    required: false,
  })
  @IsOptional()
  @IsString()
  zip_code?: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    required: false,
  })
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    required: false,
  })
  @IsOptional()
  longitude?: number;
}
