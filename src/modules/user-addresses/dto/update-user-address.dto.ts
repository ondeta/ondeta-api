import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Length,
} from 'class-validator';

export class UpdateUserAddressDto {
  @ApiProperty({
    description: 'Label for the address (e.g. Home, Work)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  label?: string;

  @ApiProperty({ description: 'Country', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  country?: string;

  @ApiProperty({ description: 'State', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  state?: string;

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  city?: string;

  @ApiProperty({ description: 'Neighborhood', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  neighborhood?: string;

  @ApiProperty({ description: 'Street', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 150)
  street?: string;

  @ApiProperty({ description: 'Street number', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  number?: string;

  @ApiProperty({ description: 'ZIP code', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  zip_code?: string;

  @ApiProperty({ description: 'Latitude', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Longitude', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description: 'Whether this address is the user default',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
