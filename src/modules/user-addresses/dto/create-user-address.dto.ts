import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Length,
} from 'class-validator';

export class CreateUserAddressDto {
  @ApiProperty({
    description: 'Label for the address (e.g. Home, Work)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  label?: string;

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

  @ApiProperty({
    description: 'Whether this address is the user default',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
