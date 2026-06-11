import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateVehicleDto {
  @ApiProperty({ description: 'Name of the vehicle', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name_vehicle?: string;

  @ApiProperty({
    description: 'Vehicle plate (7 characters)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(7, 7)
  @Matches(/^[A-Z0-9]{7}$/, {
    message: 'Plate must be 7 alphanumeric characters in uppercase',
  })
  plate?: string;

  @ApiProperty({
    description:
      'Unique device identifier for tracking (X-Device-Identifier). Must not be used by another vehicle.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  device_identifier?: string;
}
