import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Name of the vehicle' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name_vehicle!: string;

  @ApiProperty({ description: 'Vehicle plate (7 characters)' })
  @IsNotEmpty()
  @IsString()
  @Length(7, 7)
  @Matches(/^[A-Z0-9]{7}$/, {
    message: 'Plate must be 7 alphanumeric characters in uppercase',
  })
  plate!: string;

  @ApiProperty({ description: 'Device identifier for tracking' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  device_identifier!: string;
}
